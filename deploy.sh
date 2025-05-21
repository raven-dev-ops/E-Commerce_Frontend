#!/bin/bash

APP_NAME="twiinz-beard-website"

echo "Logging into Heroku container registry..."
heroku container:login

echo "Setting Heroku stack to container..."
heroku stack:set container -a $APP_NAME

echo "Building new Docker image (linux/amd64)..."
docker build --platform=linux/amd64 --no-cache -t main:latest .

echo "Tagging Docker image..."
docker tag main:latest registry.heroku.com/$APP_NAME/web

echo "Pushing Docker image..."
docker push registry.heroku.com/$APP_NAME/web

echo "Releasing Docker container..."
heroku container:release web -a $APP_NAME

echo "Checking if web dyno is running..."
DYNO_COUNT=$(heroku ps -a $APP_NAME | grep web | wc -l)
if [ "$DYNO_COUNT" -eq "0" ]; then
  echo "No web dyno running. Scaling web dyno to 1..."
  heroku ps:scale web=1 -a $APP_NAME
else
  echo "Web dyno already running."
fi

echo "Checking process status..."
heroku ps -a $APP_NAME

echo "Tailing logs..."
heroku logs --tail -a $APP_NAME
