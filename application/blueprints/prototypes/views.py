from datetime import datetime

from flask import (
    Blueprint,
    abort,
    current_app,
    g,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from flask_babel import refresh

from application.lr_data import get_available_postcodes, get_postcode_stats
from application.utils import readCSV


prototypes = Blueprint("prototypes", __name__, url_prefix="/prototypes")


@prototypes.route("/pinpoint")
def pinpoint():
    return redirect(url_for("prototypes.pinpoint_bi", lang="en"))


@prototypes.route("/<lang>/pinpoint")
def pinpoint_bi(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()
    return render_template("prototypes/pinpoint.html", pageLang=lang.lower())


@prototypes.route("/council-tax")
def council_tax():

    bands = readCSV("application/data/council_tax/council-tax-band.csv")
    rates = readCSV("application/data/council_tax/council-tax-rate.csv")

    if request.args and request.args.get("geography"):
        la_geography = request.args.get("geography")
        rates = [r for r in rates if r["geography"] == la_geography]

    # for now just reutrn current rates
    today = datetime.today()
    rates = [
        r
        for r in rates
        if r["end-date"] is None or datetime.strptime(r["end-date"], "%Y-%m-%d") > today
    ]

    return jsonify(rates)


@prototypes.route("/<lang>/by-post-code")
def by_post_code(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()

    # get all available postcodes
    postcodes = get_available_postcodes()

    return render_template(
        "prototypes/by_post_code.html",
        pageLang=lang.lower(),
        postcodes=postcodes["lr_transaction_postcode_coverage"],
    )
