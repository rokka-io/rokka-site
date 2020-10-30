#!/usr/bin/env bash
set -e

echo "Node version (should be 10 currently to not fail in the next stage): "
echo $(node --version)

rm -rf dist/*
./node_modules/.bin/gulp build:prod

# for stage
#aws s3 sync --acl public-read dist/ s3://stage-rokka-io/
#aws cloudfront  create-invalidation --distribution-id E2JJ5XIPU77PVR --paths '/*'

echo "sync to s3"
aws s3 sync --acl public-read dist/ s3://rokka-io/
echo "invalidate cloudfront"
aws cloudfront   create-invalidation --distribution-id E389UMLNXZS9QN --paths '/*'