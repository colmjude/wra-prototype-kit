# -*- coding: utf-8 -*-
"""
Flask app factory class
"""
import os

from flask import Flask, render_template, session
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


def register_context_processors(app):
    """
    Add template context variables and functions
    """

    def base_context_processor():
        return {"assetPath": "/static"}

    app.context_processor(base_context_processor)


def register_filters(app):
    pass


def register_extensions(app):
    """
    Import and register flask extensions and initialize with app object
    """
    pass


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
