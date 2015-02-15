#!/bin/bash

git pull
sudo rm -r /var/www/tracker/api
sudo rm -r /var/www/tracker/datahandler
sudo rm -r /var/www/tracker/helper
sudo rm -r /var/www/tracker/front
sudo rm -r /var/www/tracker/templates

sudo cp -r api/ /var/www/tracker/
sudo cp -r datahandler/ /var/www/datahandler/
sudo cp -r helper/ /var/www/helper/
sudo cp -r front/ /var/www/front/
sudo cp -r templates/ /var/www/templates/

sudo /etc/init.d/apache2 reload
