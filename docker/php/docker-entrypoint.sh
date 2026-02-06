#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Attend que MySQL soit accessible
until php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; do
    echo "Database not ready yet... waiting 2s"
    sleep 2
done

echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Loading fixtures..."
php bin/console doctrine:fixtures:load --no-interaction --append

echo "Initialization complete"

exec php-fpm
