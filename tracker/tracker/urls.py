from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^datahandler/([^/]+)/([^/]+)/$', 'datahandler.views.delegate_request'),
    url(r'^api/accounts/([^/]+)$', 'api.views.account'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)$', 'api.views.site'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/page_views$', 'api.views.page_views'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/visitors$', 'api.views.visitors'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/browsers$', 'api.views.browsers'),

)
