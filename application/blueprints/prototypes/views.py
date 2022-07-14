from flask import (
    abort,
    redirect,
    render_template,
    Blueprint,
    current_app,
    url_for,
    request,
)


prototypes = Blueprint("prototypes", __name__, url_prefix="/prototypes")


@prototypes.route("/pinpoint")
def pinpoint():
    return redirect(url_for("prototypes.pinpoint_bi", lang="en"))


@prototypes.route("/<lang>/pinpoint")
def pinpoint_bi(lang):
    if lang not in ["en", "cy"]:
        abort(404)
    return render_template("prototypes/pinpoint.html", pageLang=lang)
