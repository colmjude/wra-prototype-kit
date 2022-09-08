# WRA flask prototype kit

This kit allows us to do some rapid prototying of designs and pages before deciding whether to take the prototype further and create a dedicated project for it.

The latest prototypes (and links to standalone prototypes) are available at [wra-prototypes.herokuapp.com/](https://wra-prototypes.herokuapp.com/).

## Getting started (locally)

Optional but recommended. Run in a virtualenv. To create one (with Python 3) run:

```
mkvirtualenv --python=`which python3` <name>
```
where <name> is what you wish to call it.

When returning run `workon <name>` to activate the virtualenv you just created.

To install flask and all the other dependencies run:

```
make init
```

This will install the python dependencies and the npm requirements.

You will need to set some environment variables. Create a `.env` file and include these params

```
ADMIN_PASSWORD=
ADMIN_USERNAME=
```
These will allow any private pages to be behind a basic login.

Finally to start the it run:

```
flask run
```

### Put page behind basic auth

Use the decorator `@requires_auth` on the routes you want to be behind basic auth.

E.g.

```
@prototypes.route("secret-page")
@requires_auth
def secret_page():
    return render_template("prototypes/secret.html")
```


## Adding layers to the map

You can add layers by adding a record to `application/data/datasets.csv` with the respective details.

Once you add them they should show up on the `Explore land and property data` prototype (the one with the big map).

Note, you may need to tweak the URL that geoserver gives you to make sure it returns all the features for a layer. By default geoserver adds the param `&maxFeatures=50` which limits the returned features to 50. Change this to get more. It does mean you need to know the total number of features in the dataset.

## Create bilingual prototypes

Create English and Welsh versions of a prototype by providing the page lang to the route. For example,

```
@prototypes.route("/<lang>/by-post-code")
def by_post_code(lang):
    if lang.lower() not in ["en", "cy"]:
        abort(404)
    g.lang_code = lang
    refresh()
    ...
```

Here we pass either `en` or `cy` to the route. It aborts if a different string is passed in.
The lines `g.lang_code = lang` and `refresh()` tell `babel` (the library that does the switching) which language to work in.

Then in your templates, everywhere you have a string wrap it in the `_()` function.

For example,

```
<p>This is a prototype</p>
```

Should become

```
<p>{{ _("This is a prototype") }}</p>
```

Once you have set up you template run `make extract-strings`. This extracts the strings and puts them in `application/translations/cy/LC_MESSAGES/messages.po`.
You should add the welsh string to this file.

Once you have added them run `make compile-translations`. And commit the changed file.

The only other change you need to make is when linking to pages that have 2 versions. You need to include the lang parameter. For example,

```
{{ url_for('prototypes.area_selection_options', lang=langLinkSetting) }}
```

Check out the selecting areas prototype to see an example of this. Look at the [route](https://github.com/welsh-revenue-authority/prototype-kit/blob/main/application/blueprints/prototypes/views.py#L211) and the [strings in the template](https://github.com/welsh-revenue-authority/prototype-kit/blob/main/application/templates/prototypes/selecting-areas.html#L38).


## To do

* Replace Wales GEL compiled assets with building blocks
* create jinja components for common components - these should go in [WRA frontend](https://github.com/welsh-revenue-authority/wra-frontend)
