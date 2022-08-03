init:
	python -m pip install --upgrade pip
	pip install -r requirements.txt
	npm install

run:
	flask run

stylesheets:
	npm run build:gel
	npm run build:stylesheets

black:
	black .

black-check:
	black --check .

flake8:
	flake8 --exclude .venv,node_modules

isort:
	isort --profile black .

watch:
	npm run watch

extract-strings:
	pybabel extract -F babel.cfg -o messages.pot .
	pybabel extract -F babel.cfg -k lazy_gettext -o messages.pot .
	pybabel update -i messages.pot -d application/translations -l cy

compile-translations:
	pybabel compile -d application/translations
