import requests
from flask import current_app

from application.ltt import calculate_basic_ltt, calculate_higher_ltt

COVERAGE_ENDPOINT = "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_postcode_coverage"
STATS_ENDPOINT = (
    "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_stats"
)
CUSTOM_AREA_STATS_ENDPOINT = "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_stats_custom_area?geometry_string="


def generate_coverage_endpoint(date_format, valid_from=None):
    if valid_from is None:
        return COVERAGE_ENDPOINT
    return (
        COVERAGE_ENDPOINT
        + f"?postcode_valid_from_date={valid_from.strftime(date_format)}"
    )


def get_available_postcodes(date_format="%Y%m", valid_from=None):
    # why can't I use **kwargs
    r = requests.post(generate_coverage_endpoint(date_format, valid_from))
    if r.ok:
        return r.json()


def get_area_stats(geometry):
    # should we check if geometry is a Polygon?
    endpoint = CUSTOM_AREA_STATS_ENDPOINT + geometry
    r = requests.post(endpoint)
    if r.ok:
        return r.json()


def get_postcode_stats(postcode, start_date=None):
    if postcode:
        endpoint = STATS_ENDPOINT + f"?postcode_area={postcode}"

    sdate = "2018-04-01"
    if start_date is not None:
        sdate = start_date.strftime(current_app.config["API_DATE_FORMAT"])

    endpoint = endpoint + f"&start_date={sdate}"
    print(endpoint)

    r = requests.post(endpoint)
    if r.ok:
        return r.json()


def map_post_codes_to_stats(postcodes, **kwargs):
    data = {}
    for postcode in postcodes:
        stats = get_postcode_stats(postcode, **kwargs)
        data.setdefault(postcode, stats["lr_transaction_stats"][0])
    return postcode_stat_add_ltt(data)


def postcode_stat_add_ltt(data):
    for postcode in data.keys():
        for label in ["min", "max", "avg"]:
            value = data[postcode][label]
            data[postcode][label] = {
                "value": value,
                "ltt_amount": {
                    "basic": calculate_basic_ltt(value),
                    "higher": calculate_higher_ltt(value),
                },
            }
    return data


def calculate_potential_impact(postcode_data):
    total_transactions = 0
    summed_avg_price = 0

    if len(postcode_data.keys()) == 0:
        return None

    for postcode in postcode_data.keys():
        total_transactions = total_transactions + postcode_data[postcode]["count"]
        summed_avg_price = summed_avg_price + (
            postcode_data[postcode]["count"] * postcode_data[postcode]["avg"]["value"]
        )

    aggregate_avg_price = summed_avg_price / total_transactions
    average_ltt_amount = calculate_basic_ltt(aggregate_avg_price)

    return {
        "total": total_transactions,
        "average_price": aggregate_avg_price,
        "potential_ltt_revenue": total_transactions * average_ltt_amount,
    }
