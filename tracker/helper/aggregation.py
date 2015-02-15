from django.conf import settings
from datetime import datetime

def page_views(account_id, site_id, start_date, end_date):
    aggregated_data = settings.DB.command('aggregate', 'event', pipeline=[
      {
        '$match': # only match dates within the given interval and the specified account_id and site_id
        {
          'time':
          {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
            '$lt':  datetime.strptime(end_date, '%Y-%m-%d')
          },
          'account_id': account_id,
          'site_id': site_id
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
      },
      {
        '$sort':
        {
            '_id' : 1
        }
      }
    ])

    result = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in aggregated_data['result']:
        result['sites'][0]['dates'].append({'date': date['_id'], 'data' : {'page_views' : {'total' : date['total'], 'pages' : date['pages']}}})
    return result

def visitors(account_id, site_id, start_date, end_date):
    aggregated_data = settings.DB.command('aggregate', 'event', pipeline=[
      {
        '$match': # only match dates within the given interval and the specified account_id and site_id
        {
          'time':
          {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
            '$lt':  datetime.strptime(end_date, '%Y-%m-%d')
          },
          'account_id': account_id,
          'site_id': site_id
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
      },
      {
        '$sort':
        {
            '_id' : 1
        }
      }
    ])

    result = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in aggregated_data['result']:
        result['sites'][0]['dates'].append({'date': date['_id'], 'data' : {'visitors' : date['visitors']}})
    return result

def browsers(account_id, site_id, start_date, end_date):
    aggregated_data = settings.DB.command('aggregate', 'event', pipeline=[
      {
        '$match': # only match dates within the given interval and the specified account_id and site_id
        {
          'time':
          {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
            '$lt':  datetime.strptime(end_date, '%Y-%m-%d')
          },
          'account_id': account_id,
          'site_id': site_id
        }
      },
      {
        '$project': # in the aggregation project, use visitor_id field, user_agent field and a new field called date which only containts YYYY-MM-DD
        {
          'user_agent': 1,
          'visitor_id': 1,
          'date': {'$substr': ["$time", 0, 10] }
        }
      },
      {
        '$group': # first create a grouping on date so that we can get a list of user_agent/visitor_id combinations for that date
        {
          '_id': '$date',
          'browsers':
          {
            '$addToSet': { # add each combination of user_agent/visitor_id to a set
              'visitor_id': '$visitor_id',
              'browser': '$user_agent'
            }
          }
        }
      },
      {
        '$unwind': '$browsers' # unwind the browsers set so that it can be used to group on in the next step
      },
      {
        '$group': # create a grouping on date and user_agent combined so that we can count the number of user_agents per date
        {
          '_id':
          {
            'date': '$_id',
            'browser': '$browsers.browser'
          },
          'total': # make a sum for each group, which will be the number of user_agents per date
          {
            '$sum': 1
          }
        }
      },
      {
        '$group': # finally group on date
        {
          '_id': '$_id.date',
          'browsers':
          {
            '$push': # make an array of user_agent values and the count for each value
            {
              'browser': '$_id.browser',
              'total': '$total'
            }
          }
        }
      },
      {
        '$sort':
        {
            '_id' : 1
        }
      }
    ])

    result = {'account_id' : account_id, 'sites' : [{'site_id' : site_id, 'site_name' : 'None', 'dates' : []}]}
    for date in aggregated_data['result']:
        result['sites'][0]['dates'].append({'date': date['_id'], 'data' : {'browsers' : date['browsers']}})
    return result
