#!/bin/sh

# Set your source directory and target directory
SOURCE_DIR="/app/storage"
TARGET_DIR="/home/site/wwwroot"

# Monitor changes using inotifywait
inotifywait -m -r -e modify,create,delete,move "$SOURCE_DIR" | while read -r directory events filename; do
  # Use rsync to sync changes to the target directory
  rsync -av --delete "$SOURCE_DIR" "$TARGET_DIR"
done
