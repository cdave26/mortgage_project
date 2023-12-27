#!/bin/sh

cp -R /home/site/wwwroot/storage /app/
cp -R /home/site/wwwroot/log /var/

composer dump-autoload

php /app/artisan cache:clear

php /app/artisan config:clear
php /app/artisan config:cache

php /app/artisan route:clear
php /app/artisan route:cache

php /app/artisan view:clear
php /app/artisan view:cache

php /app/artisan storage:link

php /app/artisan optimize

touch /app/storage/app/public/report.xlsx

chmod -R o+rw /app/storage/
chmod -R o+rw /app/bootstrap/cache/
chmod -R o+rw /var/log/