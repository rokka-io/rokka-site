#!/usr/bin/env bash
composer install
source ~/.nvm/nvm.sh;
nvm use $NODE_JS_VERSION;
rm -rf dist/*

npm install
git clone -q https://github.com/rokka-io/rokka-dashboard.git rokka-dashboard
./node_modules/.bin/gulp build:prod