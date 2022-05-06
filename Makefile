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
