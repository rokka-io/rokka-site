#!/usr/bin/env bash
composer install
source ~/.nvm/nvm.sh;
nvm use $NODE_JS_VERSION;
rm -rf dist/*

npm install

./node_modules/.bin/gulp build:prod