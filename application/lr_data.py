import requests

COVERAGE_ENDPOINT = "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_postcode_coverage"
STATS_ENDPOINT = "https://landplatform-fastapi-dev.azurewebsites.net/lr_transaction_stats?postcode_area=CF1%3BCF2"


def get_available_postcodes():
    r = requests.post(COVERAGE_ENDPOINT)
    if r.ok:
        return r.json()


def get_postcode_stats(postcode):
    data = {}
    if postcode:
        data = {"postcode_area": postcode}
    r = requests.post(STATS_ENDPOINT, data=data)
    if r.ok:
        return r.json()
