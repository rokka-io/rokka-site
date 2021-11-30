#!/usr/bin/env bash
composer install
source ~/.nvm/nvm.sh;
nvm use $NODE_JS_VERSION;
rm -rf dist/*

npm install
if [[ ! -d rokka-dashboard/.git ]]; then
  echo "rokka-dashboard/.git did not exist, clone repo"
  find rokka-dashboard -maxdepth 1 -mindepth 1  -print0 |   xargs -0 -i rm -rf {}
  git clone -q https://github.com/rokka-io/rokka-dashboard.git rokka-dashboard
else
  cd rokka-dashboard
  git pull
  cd ..
fi
./node_modules/.bin/gulp build:prod