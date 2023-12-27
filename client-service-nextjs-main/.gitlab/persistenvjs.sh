#!/bin/sh

# Set your source directory, target directory, and log directory
SOURCE_FILE="/app/public/env.js"
TARGET_DIR="/home/site/wwwroot/"

# Monitor changes using a single inotifywait command
inotifywait -m -r -e modify,create,delete,move "$SOURCE_FILE" | while read -r directory events filename; do
  # Use rsync to sync changes in the source file to the target directory
  rsync -av --delete "$SOURCE_FILE" "$TARGET_DIR"
done