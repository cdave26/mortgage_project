FROM webdevops/php-nginx:8.2
WORKDIR /app
COPY ./install/schedule-admin-reports.conf /opt/docker/etc/supervisor.d/schedule-admin-reports.conf
COPY ./install/websockets.conf /opt/docker/etc/supervisor.d/websockets.conf
COPY ./install/persistdir.conf /opt/docker/etc/supervisor.d/persistdir.conf
COPY vhost.conf /opt/docker/etc/nginx/

RUN apt-get update \
    && apt-get install -y --no-install-recommends dialog \
    && apt-get install -y --no-install-recommends openssh-server \
    && echo "root:Docker!" | chpasswd
COPY sshd_config /etc/ssh/
COPY . .

RUN apt-get update && \
    apt-get install -y --no-install-recommends procps && \
    apt-get install -y --no-install-recommends inotify-tools && \
    docker-service enable cron && \
    echo "* * * * * root php /app/artisan schedule:run >> /var/log/cron.log 2>&1" >> /etc/crontab && \
    touch /var/log/cron.log && \
    touch /app/storage/app/public/report.xlsx && \
    COMPOSER_ALLOW_SUPERUSER=1 composer install

RUN php artisan cache:clear && \
    php artisan config:clear && \
    php artisan config:cache && \
    php artisan route:clear && \
    php artisan route:cache && \
    php artisan view:clear && \
    php artisan view:cache && \
    php artisan storage:link && \
    php artisan optimize

RUN chmod -R o+rw /app/storage/
RUN chmod -R o+rw /app/bootstrap/cache/
# RUN chmod -R o+x /app/.gitlab/*

RUN mkdir -p /run/sshd && \
    chmod 0755 /run/sshd && \
    chown root:root /run/sshd 

# this is enabling SSH For azure app service for containers
EXPOSE 6001 2222
RUN echo '[program:start_ssh]' | tee -a /opt/docker/etc/supervisor.conf > /dev/null && \
    echo "command=service ssh start" | tee -a /opt/docker/etc/supervisor.conf > /dev/null && \
    echo "autostart=true" | tee -a /opt/docker/etc/supervisor.conf > /dev/null && \
    echo "autorestart=true" | tee -a /opt/docker/etc/supervisor.conf > /dev/null && \
    echo "redirect_stderr=true" | tee -a /opt/docker/etc/supervisor.conf > /dev/null && \
    echo "stdout_logfile=/var/log/start_ssh.log" | tee -a /opt/docker/etc/supervisor.conf > /dev/null

ENTRYPOINT [ "/entrypoint", "supervisord" ] 
