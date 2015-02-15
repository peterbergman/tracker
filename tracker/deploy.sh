#!/bin/bash

git pull
sudo rm -r /var/www/tracker/api
sudo rm -r /var/www/tracker/datahandler
sudo rm -r /var/www/tracker/helper
sudo rm -r /var/www/tracker/front
sudo rm -r /var/www/tracker/templates

sudo cp -r api /var/www/tracker
sudo cp -r datahandler /var/www/tracker
sudo cp -r helper /var/www/tracker
sudo cp -r front /var/www/tracker
sudo cp -r templates /var/www/tracker

sudo /etc/init.d/apache2 reload
