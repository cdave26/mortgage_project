#!/bin/sh
set -e
# service ssh start
/usr/sbin/sshd
sh /app/copy-state.sh

cd /app

sh /app/persistlog.sh & sh /app/persistenvjs.sh & node /app/build.js & exec yarn start
