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


Finally to start the it run:

```
flask run
```

## Adding layers to the map

You can add layers by adding a record to `application/data/datasets.csv` with the respective details.

Note, you may need to tweak the URL that geoserver gives you to make sure it returns all the features for a layer. By default geoserver adds the param `&maxFeatures=50` which limits the returned features to 50. Change this to get more. It does mean you need to know the total number of features in the dataset.

## To do

* Replace Wales GEL compiled assets with building blocks
* create jinja components for common components
