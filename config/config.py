# -*- coding: utf-8 -*-
import json
import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    APP_ROOT = os.path.abspath(os.path.dirname(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_ROOT, os.pardir))
    SECRET_KEY = os.getenv("SECRET_KEY")
    LANGUAGES = {"en": "English", "cy": "Cymraeg"}
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
    API_DATE_FORMAT = "%Y-%m-%d"


class DevelopmentConfig(Config):
    DEBUG = True


class TestConfig(Config):
    TESTING = True
