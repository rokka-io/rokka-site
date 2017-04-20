#!/bin/bash

if [[ "$TRAVIS_PULL_REQUEST" == 'false' && "$TRAVIS_BRANCH" == 'master' ]]; then
	export BUILD_CMD='build:prod'
	export CLOUDFRONT_DISTRIBUTION_ID='E389UMLNXZS9QN'
else
	export CLOUDFRONT_DISTRIBUTION_ID='E2JJ5XIPU77PVR'
	export BUILD_CMD='build:stage'
fi