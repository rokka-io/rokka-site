FROM php:8.3-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl git zip unzip libzip-dev gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install zip

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm --version && node --version

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /root/deploy
