#!/bin/bash
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

export PUBLIC_URL='/assets/dashboard'
export REACT_APP_HEAD_TAG='<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start": new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f); })(window,document,"script","dataLayer","GTM-WVCKFW");</script><!-- End Google Tag Manager -->'
export REACT_APP_BODY_TAG='<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WVCKFW" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->'

# install deps and run prod build
npm install
npm run build

# create target directories
mkdir -p ../dist/assets/dashboard
mkdir -p ../dist/dashboard

# copy build files
cp build/*.{json,ico} ../dist/assets/dashboard
cp -R build/static ../dist/assets/dashboard
cp build/index.html ../dist/dashboard/
