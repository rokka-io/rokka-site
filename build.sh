#!/usr/bin/env bash
set -e

echo "Node version:"
node --version

rm -rf dist/*
npm run build

# for stage
#aws s3 sync --acl public-read dist/ s3://stage-rokka-io/
#aws cloudfront  create-invalidation --distribution-id E2JJ5XIPU77PVR --paths '/*'

echo "sync to s3"
aws s3 sync --acl public-read dist/ s3://rokka-io/
echo "invalidate cloudfront"
aws cloudfront   create-invalidation --distribution-id E389UMLNXZS9QN --paths '/*'
