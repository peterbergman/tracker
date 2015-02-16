from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^datahandler/([^/]+)/([^/]+)/$', 'datahandler.views.delegate_request'),

    url(r'^api/accounts/([^/]+)$', 'api.views.get_or_update_account'),
    url(r'^api/accounts/$', 'api.views.create_account'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)$', 'api.views.site'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/page_views$', 'api.views.page_views'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/visitors$', 'api.views.visitors'),
    url(r'^api/accounts/([^/]+)/sites/([^/]+)/start_date/([^/]+)/end_date/([^/]+)/browsers$', 'api.views.browsers'),

    url(r'^page_views/$', 'front.views.page_views'),
    url(r'^visitors/$', 'front.views.visitors'),
    url(r'^browsers/$', 'front.views.browsers'),
    url(r'^create_site/$', 'front.views.create_site'),
    url(r'^$', 'front.views.login'),
)
