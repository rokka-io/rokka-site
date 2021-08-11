#!/usr/bin/env bash
# please dont forget to run ./docker/build.sh in case you don't have the image yet
docker run --rm -v $PWD:/root/deploy -v rokka-site-node_modules:/root/deploy/node_modules -v rokka-site-dashboard:/root/deploy/rokka-dashboard rokka-site-deploy:latest ./docker/buildDeployment.sh



