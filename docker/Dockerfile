FROM  php:7.4

RUN apt-get update && apt-get install -y wget git  libzip-dev zip
RUN docker-php-ext-install zip
ENV NODE_JS_VERSION=10
RUN mkdir -p ~/.nvm/
RUN curl -o ~/.nvm/nvm.sh https://raw.githubusercontent.com/creationix/nvm/v0.31.0/nvm.sh # update nvm
RUN bash -c "source ~/.nvm/nvm.sh; nvm install $NODE_JS_VERSION;"
ARG COMPOSER_VERSION=1.10.22
ADD build-composer.sh .
RUN bash ./build-composer.sh && mv composer.phar /usr/local/bin
RUN ln -s  /usr/local/bin/composer.phar /usr/local/bin/composer
WORKDIR /root/deploy
