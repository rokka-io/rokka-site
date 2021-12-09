#!/usr/bin/env bash

echo "sync to s3"
aws s3 sync --acl public-read  dist/ s3://rokka-io/
echo "invalidate cloudfront"
aws cloudfront create-invalidation --distribution-id E389UMLNXZS9QN --paths '/*' > /dev/null
