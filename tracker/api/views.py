from django.http import HttpResponse
from api.models import *
from datetime import datetime
from django.conf import settings
from bson.json_util import dumps
import jsonpickle
import json

def get_account(request, account_id):
    response = HttpResponse(content_type='application/json')
    response.content = dumps(settings.DB.account.find({'account_id' : account_id}, {'password': False, '_id': False}))
    return response

def create_account(request):
    email = parse_email(request)
    password = parse_password(request)
    if email == None or password == None:
        response = HttpResponse(status=400)
    else:
        account = Account(email, password)
        json_str = jsonpickle.encode(account, unpicklable=False)
        settings.DB.account.insert(json.loads(json_str))
        response = HttpResponse(status=201)
    return response

def parse_email(request):
    """Parse the email from the POST request variables."""
    return request.POST.get('email')

def parse_password(request):
    """Parse the password from the POST request variables."""
    return request.POST.get('password')

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
        '$project': # in the aggregation project, use page_url field and a new field called date which only containts YYYY-MM-DD
        {
          'page_url': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group': # first create a grouping on page_url AND date
        {
          '_id':
          {
            'url':'$page_url',
            'date':'$date'
          },
          'dates':
          {
            '$push': '$date' # for each group, create an array of dates where the page been hit (multiple hits during one day are represented with multiple entries in the array)
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
        '$project': # in the aggregation project, use visitor_id field and a new field called date which only containts YYYY-MM-DD
        {
          'visitor_id': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group': # first group on dates and for each date, make a set of all visitor_id values that had an event reqistered that date
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
        '$unwind': '$visitors' # unwind the visitors set so that the next step can count all visitor_id values for each date
      },
      {
        '$group': # again group on date
        {
          '_id': '$_id',
          'visitors':
          {
            '$sum': 1 # for each group, sum all the visitor_id values in that group which is the visitor count for that date
          }
        }
      }
    ])

    response = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in result['result']:
        response['sites'][0]['dates'].append({date['_id'] : {'visitors' : date['visitors']}})
    return HttpResponse(dumps(response), content_type='application/json')

def browsers(request, account_id, site_id, start_date, end_date):
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
          'user_agent': 1,
          'visitor_id': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group': # first create a grouping on user_agent AND visitor_id
        {
          '_id':
          {
            'user_agent':'$user_agent',
            'visitor_id' : '$visitor_id'
          },
          'dates':
          {
            '$push': '$date' # for each group, create an array of dates where the combination of user_agent/visitor_id has been seen (multiple hits during one day are represented with multiple entries in the array)
          }
        }
      },
      {
        '$unwind': '$dates' # unwind the date array so that it can be used to group on in the next step
      },
      {
        '$group': # group on dates
        {
          '_id': '$dates',
          'browsers':
          {
            '$addToSet': '$_id.user_agent' # for each date, make a set of user_agent values
          }
        }
      },
      {
        '$unwind' : '$browsers' # unwind the set of user_agent values so that it can be used in the next step to make a count of the number of different user_agent values per date
      },
      {
        '$group': # group on date again
        {
          '_id': '$_id',
          'browsers':
          {
            '$addToSet' : '$browsers' # add each user_agent to a set
          },
          'total':
          {
            '$sum': 1 # make a sum for all user_agent values per date which will be the count of unique user_agent for each date
          }
        }
      }
    ])

    response = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in result['result']:
        response['sites'][0]['dates'].append({date['_id'] : {'browsers' : {'total' : date['total'], 'browsers' : date['browsers']}}})

    return HttpResponse(dumps(response), content_type='application/json')
