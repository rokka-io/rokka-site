#!/bin/bash

# clone repo and make sure we're up to date
if [ ! -d rokka-dashboard ]; then
  git clone -q https://github.com/rokka-io/rokka-dashboard.git rokka-dashboard
fi

cd rokka-dashboard
git checkout -q master
git pull origin master

# install deps and run prod build
npm install
npm run build /assets/dashboard

# create target directories
mkdir -p ../dist/assets/dashboard
mkdir -p ../dist/dashboard

# copy build files
cp build/*.{svg,json,ico} ../dist/assets/dashboard
cp -R build/static ../dist/assets/dashboard
cp build/index.html ../dist/dashboard/