FROM php:8.3-fpm-alpine

RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        oniguruma-dev \
        make \
        g++ \
    && apk add --no-cache \
        icu-libs \
        git \
        unzip \
        bash \
        mariadb-client \
    && docker-php-ext-install pdo pdo_mysql intl opcache \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm"]
