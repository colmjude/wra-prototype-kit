from flask_wtf import FlaskForm
from wtforms import RadioField, SelectField
from wtforms.validators import DataRequired


class KnowAddressForm(FlaskForm):
    has_address = RadioField(
        "Do you have a postal address for the transaction item?",
        validators=[DataRequired("You must select one option")],
        choices=[
            ("Yes", "Yes, there is a postal address"),
            ("No", "No, I do not know the postal address"),
        ],
    )


class LocalAuthorityForm(FlaskForm):
    local_authority = SelectField(
        "Do you know the local authority it is in?",
        validators=[DataRequired(message="Select Local Authority")],
    )
