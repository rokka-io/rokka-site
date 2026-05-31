#!/usr/bin/env bash
composer install
rm -rf dist/*

npm install

./node_modules/.bin/gulp build:prod