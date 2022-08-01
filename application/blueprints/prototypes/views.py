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

from .forms import PostCodeForm

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


@prototypes.route("/<lang>/by-post-code", methods=["GET", "POST"])
def by_post_code(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()

    selected = []
    if request.args and request.args.get("selected_postcodes"):
        selected = request.args.get("selected_postcodes").split(";")
    print(selected)

    form = PostCodeForm()

    # get all available postcodes
    postcodes = get_available_postcodes()

    form.postcodes.choices = [
        (postcode["postcode_area"], postcode["postcode_area"])
        for postcode in postcodes["lr_transaction_postcode_coverage"]
    ]

    if form.validate_on_submit():
        # add new selection to list
        selected.append(form.postcodes.data)
        return redirect(
            url_for(
                "prototypes.by_post_code",
                lang=g.lang_code,
                selected_postcodes=";".join(selected),
            )
        )

    return render_template(
        "prototypes/by_post_code.html",
        form=form,
        pageLang=lang.lower(),
        postcodes=postcodes["lr_transaction_postcode_coverage"],
        selected=selected,
    )
