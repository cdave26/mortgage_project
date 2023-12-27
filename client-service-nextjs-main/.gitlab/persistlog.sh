#!/bin/sh

# Set your target directory, and log directory
TARGET_DIR="/home/site/wwwroot"
LOG_DIR="/var/log"

# Monitor changes using a single inotifywait command
inotifywait -m -r -e modify,create,delete,move "$LOG_DIR" | while read -r directory events filename; do
  # Use rsync to sync changes in the log directory to the target directory
  rsync -av --delete "$LOG_DIR" "$TARGET_DIR"
done