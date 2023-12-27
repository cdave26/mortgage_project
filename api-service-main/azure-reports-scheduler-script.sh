#!/bin/bash

## FOR AZURE STARTUP SCRIPT

# Update packages
apt-get update -y

# Install packages
apt-get install -y supervisor
apt-get install -y cron

touch /etc/supervisor/conf.d/schedule-admin-reports.conf
touch /etc/supervisor/conf.d/websockets.conf

echo "[program:RunQueueListener]
process_name=%(program_name)s_%(process_num)02d
command=php /home/site/wwwroot/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
killasgroup=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/schedule-conf.log
stdout_logfile_maxbytes=0
stdout_events_enabled=true
stderr_events_enabled=true
priority=100" >> /etc/supervisor/conf.d/schedule-admin-reports.conf

echo "[program:RunPusherWebsocketListener]
process_name=%(program_name)s_%(process_num)02d
command=php /home/site/wwwroot/artisan websockets:serve
autostart=true
autorestart=true
killasgroup=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/websocket-conf.log
stdout_logfile_maxbytes=0
stdout_events_enabled=true
stderr_events_enabled=true
priority=99" >> /etc/supervisor/conf.d/websockets.conf

# create scheduler log file 
touch /var/log/cron.log

# Add scheduler runner to crontab
echo "* * * * * root php /home/site/wwwroot/artisan schedule:run >> /var/log/cron.log 2>&1" >> /etc/crontab

# Reload Supervisor config
service cron start
service supervisor start