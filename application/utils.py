import csv
import json

from datetime import datetime
from dateutil.relativedelta import relativedelta


def create_dict(keys_list, values_list):
    zip_iterator = zip(keys_list, values_list)
    return dict(zip_iterator)


def str_to_bool(str):
    if str in ["t", "T", "True", "true"]:
        return True
    return False


def readCSV(filename, json_blobs=[], bool_fields=[]):
    rows = []
    with open(filename, mode="r") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            for k in row.keys():
                if k in json_blobs:
                    row[k] = json.loads(row[k])
                if k in bool_fields:
                    row[k] = str_to_bool(row[k])
            rows.append(row)
    return rows


def remove_duplicates(l):
    return list(set(l))


def one_year_ago():
    return datetime.today() - relativedelta(months=12)
