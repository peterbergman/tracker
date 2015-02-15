#!/bin/bash

REPO_DIR=`pwd`

git reset --hard
git pull

sudo chmod 777 deploy.sh

sudo rm -r /var/www/tracker/api
sudo rm -r /var/www/tracker/datahandler
sudo rm -r /var/www/tracker/helper
sudo rm -r /var/www/tracker/front
sudo rm -r /var/www/tracker/templates

cd /var/www/tracker

sudo django-admin startapp api
sudo django-admin startapp datahandler
sudo django-admin startapp helper
sudo django-admin startapp front

cd $REPO_DIR

sudo cp -r api /var/www/tracker
sudo cp -r datahandler /var/www/tracker
sudo cp -r helper /var/www/tracker
sudo cp -r front /var/www/tracker
sudo cp -r templates /var/www/tracker

sudo /etc/init.d/apache2 reload
