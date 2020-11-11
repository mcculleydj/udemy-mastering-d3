#!/bin/bash

echo "Building and deploying the Vue application..."
yarn run build
scp -r -i ~/.ssh/mcculleydj.dev.pem dist ubuntu@54.203.119.188:/home/ubuntu/d3
ssh -i ~/.ssh/mcculleydj.dev.pem ubuntu@54.203.119.188 sudo systemctl restart nginx
