from django.http import HttpResponse
#from api.models import *
from datetime import datetime
from django.conf import settings
from bson.json_util import dumps

def account(request, account_id):
    response = HttpResponse(content_type='application/json')
    #content = Account.objects(account_id = account_id)
    #response.content = content.to_json()
    response.content = dumps(settings.DB.account.find({'account_id' : account_id}, {'users.user_password': False, '_id': False}))
    return response

def site(request, account_id, site_id, start_date, end_date):
    print('account_id: ' + account_id)
    print('site_id: ' + site_id)
    print('start_date: ' + start_date)
    print('end_date: ' + end_date)


    result = settings.DB.command('aggregate', 'event', pipeline=[
     {'$match': {
               'time': {
                   '$gte': datetime(2015,2,1),
                   '$lt':  datetime(2015,2,10) } } },
         {  '$project': {
                 'page_url': 1,
                 'date': {
                     'y': { '$year': '$time' },
                     'm': { '$month': '$time' },
                     'd': { '$dayOfMonth': '$time' } } } },
         { '$group': {
                 '_id': {
                     'p':'$page_url',
                     'y': '$date.y',
                     'm': '$date.m',
                     'd': '$date.d' },
                 'hits': { '$sum': 1 } } },
         ])


    return HttpResponse(dumps(result), content_type='application/json')
