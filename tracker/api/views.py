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
    return HttpResponse('{}', content_type='application/json')

def page_views(request, account_id, site_id, start_date, end_date):
    result = settings.DB.command('aggregate', 'event', pipeline=[
      {
        '$match': # only match dates within the given interval
        {
          'time':
          {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
            '$lt':  datetime.strptime(end_date, '%Y-%m-%d')
          }
        }
      },
      {
        '$project': # in the aggregation project, use page url field and a new field called date which only containts YYYY-MM-DD
        {
          'page_url': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group': # first create a grouping on page_url AND date, then for each group, create an array of dates where its been hit (multiple hits during one day are represented with multiple entries in the array)
        {
          '_id':
          {
            'url':'$page_url',
            'date':'$date'
          },
          'dates':
          {
            '$push': '$date'
          },
          'hits':
          {
            '$sum':1 # make a sum from the number of hits for each page_url (i.e. the length of the dates array)
          }
        }
      },
      {
        '$unwind': '$dates' # unwind the dates array so that the next grouping step can be done on dates
      },
      {
        '$group': # last step is to group on dates and for each date, create a set of page_urls and the number of hits for each page_url
        {
          '_id': '$dates',
          'pages':
          {
            '$addToSet': {'page_url':'$_id.url', 'page_views':'$hits'}
          },
          'total':
          {
            '$sum': 1 # make a sum for all dates grouped on date which will be the total number of hits for that date
          }
        }
      }
    ])

    response = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in result['result']:
        response['sites'][0]['dates'].append({date['_id'] : {'page_views' : {'total' : date['total'], 'pages' : date['pages']}}})

    return HttpResponse(dumps(response), content_type='application/json')

def visitors(request, account_id, site_id, start_date, end_date):
    result = settings.DB.command('aggregate', 'event', pipeline=[
      {
        '$match': # only match dates within the given interval
        {
          'time':
          {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
            '$lt':  datetime.strptime(end_date, '%Y-%m-%d')
          }
        }
      },
      {
        '$project':
        {
          'visitor_id': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group':
        {
          '_id': '$date',
          'visitors':
          {
            '$addToSet':
            {
              'visitor_id': '$visitor_id'
            }
          }
        }
      },
      {
        '$unwind': '$visitors'
      },
      {
        '$group':
        {
          '_id': '$_id',
          'visitors':
          {
            '$sum': 1
          }
        }
      }
    ])

    response = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in result['result']:
        response['sites'][0]['dates'].append({date['_id'] : {'visitors' : date['visitors']}})
    return HttpResponse(dumps(response), content_type='application/json')
