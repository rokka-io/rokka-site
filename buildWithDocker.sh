#!/usr/bin/env bash
# please dont forget to run ./docker/build.sh in case you don't have the image yet
docker run --rm -v $PWD:/root/deploy -v rokka-site-node_modules:/root/deploy/node_modules docker.gitlab.liip.ch/rokka/rokka-site-build-docker:node10 ./docker/buildDeployment.sh



