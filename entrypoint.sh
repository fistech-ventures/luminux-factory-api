#!/bin/bash

# Create the log directory and log file
mkdir -p /logs
touch /logs/app.log

# yarn db:migration:run
yarn db:seed
node dist/main.js