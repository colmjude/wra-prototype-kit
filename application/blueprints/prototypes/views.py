from flask import redirect, render_template, Blueprint, current_app, url_for, request


prototypes = Blueprint("prototypes", __name__, url_prefix="/prototypes")


@prototypes.route("/pinpoint")
def pinpoint():
    return render_template("prototypes/pinpoint.html")
