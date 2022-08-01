from flask_wtf import FlaskForm
from wtforms import SelectField
from wtforms.validators import DataRequired


class PostCodeForm(FlaskForm):
    postcodes = SelectField(
        "Select postcode(s)",
        validators=[DataRequired(message="You need to select one or more postcodes")],
    )
