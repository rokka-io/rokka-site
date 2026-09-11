FROM node:22-bookworm-slim

# git is needed by install-dashboard.sh, which clones rokka-dashboard.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/deploy
