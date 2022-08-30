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

from application.auth import requires_auth
from application.lr_data import (
    calculate_potential_impact,
    get_available_postcodes,
    map_post_codes_to_stats,
    get_area_stats,
)
from application.utils import readCSV, remove_duplicates, one_year_ago


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

    # check for previous selections
    selected = []
    if request.args and request.args.get("selected_postcodes"):
        selected = request.args.getlist("selected_postcodes")
    print(selected)

    form = PostCodeForm()

    # get all available postcodes
    postcodes = get_available_postcodes(valid_from=datetime.today())

    form.new_postcode.choices = [("", "")] + [
        (postcode["postcode_area"], postcode["postcode_area"])
        for postcode in postcodes["lr_transaction_postcode_coverage"]
    ]

    # check for new selections
    if request.args and request.args.get("new_postcode"):
        new_selection = request.args.get("new_postcode")
        form.new_postcode.data = new_selection
        # perform validation check?
        selected.append(new_selection)
        selected = remove_duplicates(selected)
        return redirect(
            url_for(
                "prototypes.by_post_code",
                lang=g.lang_code,
                selected_postcodes=selected,
            )
        )

    # get stats for selected post codes
    postcode_data = {}
    if len(selected):
        postcode_data = map_post_codes_to_stats(selected, start_date=one_year_ago())

    aggregate_summary = calculate_potential_impact(postcode_data)

    return render_template(
        "prototypes/by_post_code.html",
        form=form,
        pageLang=lang.lower(),
        postcodes=postcodes["lr_transaction_postcode_coverage"],
        selected_postcodes=postcode_data,
        aggregate_summary=aggregate_summary,
        a_yr_ago=one_year_ago().strftime("%Y-%m-%d"),
    )


@prototypes.route("/postcode-stats/<postcode>")
def postcode_stats(postcode):
    return jsonify(map_post_codes_to_stats([postcode], start_date=one_year_ago()))


@prototypes.route("/postcode-stats/")
def aggregate_postcode_stats():
    selected = []
    if request.args and request.args.get("postcode"):
        selected = request.args.getlist("postcode")

    if len(selected) == 0:
        return jsonify({})

    aggregate_summary = calculate_potential_impact(
        map_post_codes_to_stats(selected, start_date=one_year_ago())
    )
    return jsonify(aggregate_summary)


@prototypes.route("<lang>/by-post-code/remove/<postcode>")
def remove_selected_post_code(lang, postcode):
    selected = []
    if request.args and request.args.get("selected_postcodes"):
        selected = request.args.getlist("selected_postcodes")

    selected.remove(postcode)

    return redirect(
        url_for(
            "prototypes.by_post_code",
            lang=lang,
            selected_postcodes=selected,
        )
    )


@prototypes.route("/<lang>/by-post-code-wip")
def by_post_code_wip(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()

    # check for previous selections
    selected = []
    if request.args and request.args.get("selected_postcodes"):
        selected = request.args.getlist("selected_postcodes")
    print(selected)

    form = PostCodeForm()

    # get all available postcodes
    postcodes = get_available_postcodes()

    form.new_postcode.choices = [("", "")] + [
        (postcode["postcode_area"], postcode["postcode_area"])
        for postcode in postcodes["lr_transaction_postcode_coverage"]
    ]

    # check for new selections
    if request.args and request.args.get("new_postcode"):
        new_selection = request.args.get("new_postcode")
        form.new_postcode.data = new_selection
        # perform validation check?
        selected.append(new_selection)
        selected = remove_duplicates(selected)
        return redirect(
            url_for(
                "prototypes.by_post_code",
                lang=g.lang_code,
                selected_postcodes=selected,
            )
        )

    # get stats for selected post codes
    postcode_data = {}
    if len(selected):
        postcode_data = map_post_codes_to_stats(selected)

    return render_template(
        "prototypes/by_post_code_wip.html",
        form=form,
        pageLang=lang.lower(),
        postcodes=postcodes["lr_transaction_postcode_coverage"],
        selected_postcodes=postcode_data,
    )


@prototypes.route("/<lang>/selecting-areas")
def area_selection_options(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()

    return render_template(
        "prototypes/selecting-areas.html",
        pageLang=lang.lower(),
    )


@prototypes.route("/area-stats/")
def area_stats():
    geometry = None
    if request.args and request.args.get("geometry"):
        geometry = request.args.get("geometry")

    if geometry is not None:
        return jsonify(get_area_stats(geometry))


# an example of how to secure a page with basic auth
@prototypes.route("secret-page")
@requires_auth
def secret_page():
    return render_template("prototypes/secret.html")
