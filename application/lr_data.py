import requests

from application.ltt import calculate_basic_ltt, calculate_higher_ltt

COVERAGE_ENDPOINT = "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_postcode_coverage"
STATS_ENDPOINT = (
    "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_stats"
)


def get_available_postcodes():
    r = requests.post(COVERAGE_ENDPOINT)
    if r.ok:
        return r.json()


def get_postcode_stats(postcode):
    endpoint = STATS_ENDPOINT
    if postcode:
        endpoint = STATS_ENDPOINT + f"?postcode_area={postcode}"
    r = requests.post(endpoint)
    if r.ok:
        return r.json()


def map_post_codes_to_stats(postcodes):
    data = {}
    for postcode in postcodes:
        stats = get_postcode_stats(postcode)
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

    return {
        "total": total_transactions,
        "average_price": aggregate_avg_price,
        "potential_ltt_revenue": total_transactions * aggregate_avg_price,
    }
