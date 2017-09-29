#!/bin/bash
set -x
set -e
set -o pipefail

# remove the whole rokka-dashboard dir, if no repo is there
if [ ! -d rokka-dashboard/.git ]; then
  rm -rf rokka-dashboard
fi

# clone repo and make sure we're up to date
if [ ! -d rokka-dashboard ]; then
  git clone -q https://github.com/rokka-io/rokka-dashboard.git rokka-dashboard
fi

cd rokka-dashboard
git checkout master
git pull origin master

# install deps and run prod build
npm install
npm run build /assets/dashboard

# create target directories
mkdir -p ../dist/assets/dashboard
mkdir -p ../dist/dashboard

# copy build files
cp build/*.{json,ico} ../dist/assets/dashboard
cp -R build/static ../dist/assets/dashboard
cp build/index.html ../dist/dashboard/
