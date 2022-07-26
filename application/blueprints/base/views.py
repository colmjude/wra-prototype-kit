import json

from flask import render_template, Blueprint, current_app, g, abort, url_for, redirect
from flask_babel import refresh


base = Blueprint("base", __name__)


def read_json_file(data_file_path):
    f = open(
        data_file_path,
    )
    data = json.load(f)
    f.close()
    return data


@base.route("/")
@base.route("/index")
def index():
    return redirect(url_for("base.index_bi", lang="en"))


@base.route("/<lang>/")
@base.route("/<lang>/index")
def index_bi(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()
    return render_template("index.html", pageLang=lang.lower())
