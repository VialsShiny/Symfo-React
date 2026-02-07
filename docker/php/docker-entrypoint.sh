#!/bin/sh
set -e

echo "Starting Symfony container…"

# Valeur par défaut si APP_ENV n'est pas défini
APP_ENV=${APP_ENV:-prod}

echo "APP_ENV=$APP_ENV"

# 1️⃣ Attendre que la base soit prête
echo "Waiting for database to be ready..."
until php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; do
    echo "Database not ready yet… waiting 2s"
    sleep 2
done
echo "Database is ready."

# 2️⃣ S'assurer que la base existe
echo "Ensuring database exists..."
php bin/console doctrine:database:create --if-not-exists --no-interaction || true

# 3️⃣ Lancer les migrations (source de vérité)
echo "Running migrations..."
php bin/console doctrine:migrations:migrate \
  --no-interaction \
  --allow-no-migration

# 4️⃣ Charger les fixtures uniquement en DEV
if [ "$APP_ENV" = "dev" ]; then
    echo "Loading fixtures (DEV only)..."
    php bin/console doctrine:fixtures:load \
      --no-interaction \
      --append || echo "Fixtures skipped"
fi

echo "Initialization complete ✅"

# 5️⃣ Lancer PHP-FPM
exec php-fpm
