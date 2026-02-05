FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
        git \
        unzip \
        icu-dev \
        oniguruma-dev \
        bash \
        mariadb-client \
    && docker-php-ext-install pdo pdo_mysql intl opcache \
    && apk del icu-dev oniguruma-dev   # nettoyer les packages de build

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy le Script (BDD)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Run Script
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
