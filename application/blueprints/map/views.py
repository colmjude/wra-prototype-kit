import json

from flask import redirect, render_template, Blueprint, current_app, url_for, request
from application.blueprints.map.forms import KnowAddressForm, LocalAuthorityForm
from application.las import LOCAL_AUTHORITIES
from application.utils import readCSV


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


@map.route("/locate-property", methods=["GET", "POST"])
def know_address():
    form = KnowAddressForm()

    if form.validate_on_submit():
        print(form.data)
        if form.has_address.data == "Yes":
            return redirect(url_for("map.address"))
        return redirect(url_for("map.local_authority"))
    return render_template("map/know-address.html", form=form)


@map.route("/locate-property/address")
def address():
    return render_template("map/address.html")


@map.route("/locate-property/local-authority")
def local_authority():
    form = LocalAuthorityForm()
    form.local_authority.choices = LOCAL_AUTHORITIES

    if request.args and request.args.get("local_authority"):
        return redirect(
            url_for("map.region", region=request.args.get("local_authority"))
        )
    return render_template("map/local-authority.html", form=form)


@map.route("/locate-property/map")
def region():
    return render_template("map/region.html", region=request.args.get("region"))


# ================
# Explorer version
# ================


def get_dataset_list():
    return readCSV(
        "application/data/datasets.csv",
        json_blobs=["paint_options"],
        bool_fields=["default_checked"],
    )


@map.route("explorer")
def explorer():
    datasets = get_dataset_list()
    return render_template("map/explorer.html", datasets=datasets)


@map.route("search")
def search():
    datasets = get_dataset_list()
    layer_names = []
    for d in datasets:
        layer_names.append(d["geoserver_layer_name"])
    return render_template("map/search.html", layer_names=";".join(layer_names))
