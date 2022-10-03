#!/usr/bin/env bash
# please dont forget to run ./docker/build.sh in case you don't have the image yet
docker run --rm -v $PWD:/root/deploy -v rokka-site-node_modules_18:/root/deploy/node_modules docker.gitlab.liip.ch/rokka/rokka-site-build-docker:node18 ./docker/buildDeployment.sh



