from flask_wtf import FlaskForm
from wtforms import SelectField
from wtforms.validators import DataRequired

from flask_babel import lazy_gettext


class PostCodeForm(FlaskForm):
    new_postcode = SelectField(
        lazy_gettext("Select a postcode"),
        validators=[DataRequired(message="You need to select one or more postcodes")],
    )
