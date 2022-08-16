# -*- coding: utf-8 -*-
"""
Flask app factory class
"""
import imp
import os

from flask import Flask, g, render_template, request, session
from flask.cli import load_dotenv

load_dotenv()


def create_app(config_filename):
    """
    App factory function
    """
    app = Flask(__name__)
    app.config.from_object(config_filename)
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 10

    register_blueprints(app)
    register_context_processors(app)
    register_templates(app)
    register_filters(app)
    register_extensions(app)

    return app


def register_blueprints(app):
    """
    Import and register blueprints
    """

    from application.blueprints.base.views import base

    app.register_blueprint(base)

    from application.blueprints.map.views import map

    app.register_blueprint(map)

    from application.blueprints.prototypes.views import prototypes

    app.register_blueprint(prototypes)


def register_context_processors(app):
    """
    Add template context variables and functions
    """

    def base_context_processor():
        return {"assetPath": "/static"}

    app.context_processor(base_context_processor)


def register_filters(app):
    from wra_frontend.filters import commanum_filter

    app.add_template_filter(commanum_filter, name="commanum")

    from application.filters import hex_to_rgb_string_filter, strip_zero_decimals_filter

    app.add_template_filter(hex_to_rgb_string_filter, name="hex_to_rgb")
    app.add_template_filter(strip_zero_decimals_filter, name="strip_zero_decimals")


def register_extensions(app):
    """
    Import and register flask extensions and initialize with app object
    """
    from application.extensions import babel

    babel.init_app(app)
    # set up babel - could this go in extensions.py ?
    @babel.localeselector
    def get_locale():
        if not g.get("lang_code", None):
            g.lang_code = request.accept_languages.best_match(app.config["LANGUAGES"])
        return g.lang_code


def register_templates(app):
    """
    Register templates from packages

    This is where we'll register templates from WRA frontend
    """
    from jinja2 import ChoiceLoader, PackageLoader, PrefixLoader

    multi_loader = ChoiceLoader(
        [
            app.jinja_loader,
            PrefixLoader(
                {
                    "wra-frontend": PackageLoader("wra_frontend"),
                }
            ),
        ]
    )
    app.jinja_loader = multi_loader
