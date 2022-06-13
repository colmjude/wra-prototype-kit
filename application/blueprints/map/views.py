import json

from flask import render_template, Blueprint, current_app


map = Blueprint("map", __name__, url_prefix="/map")


def read_json_file(data_file_path):
    f = open(
        data_file_path,
    )
    data = json.load(f)
    f.close()
    return data


@map.route("/")
@map.route("/index")
def index():
    return render_template("map/la.html")


@map.route("/locate-a-region")
def region():
    return render_template("map/region.html")
