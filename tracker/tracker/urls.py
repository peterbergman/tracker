from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^datahandler/$', 'datahandler.views.delegate_request'),
)
