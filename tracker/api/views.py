from django.http import HttpResponse
from api.models import *
from datetime import datetime
from django.conf import settings
from bson.json_util import dumps
import jsonpickle
import json
import base64
from helper import aggregation

def get_account(request, value):
    """Fetch and existing account from the database."""
    if '@' not in value:
        key = 'account_id'
    else:
        key = 'email'
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if auth_header == None:
        response = HttpResponse(content_type='application/json', status=403)
    else:
        auth_string = str(base64.b64decode(auth_header))
        username = auth_string.split(':')[0][2:]
        password = auth_string.split(':')[1][:-1]
        result = settings.DB.account.find({key : username, 'password': password}, {'password': False, '_id': False});
        print('username: ' + username)
        print('password: ' + password)
        if result.count() == 0:
            response = HttpResponse(content_type='application/json', status=404)
        else:
            response = HttpResponse(content_type='application/json')
            response.content = dumps(result[0])
    return response

def create_account(request):
    """Create a new account in the database."""
    email = parse_email(request)
    password = parse_password(request)
    if email == None or password == None:
        response = HttpResponse(status=400)
    else:
        account = Account(email, password)
        json_str = jsonpickle.encode(account, unpicklable=False)
        try:
            settings.DB.account.insert(json.loads(json_str))
            response = HttpResponse(status=201)
        except:
            response = HttpResponse(status=400)
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
    """Fetch number of page views per page from a site within the given interval of dates."""
    response = aggregation.page_views(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')

def visitors(request, account_id, site_id, start_date, end_date):
    """Fetch number of visitors from a site within the given interval of dates."""
    response = aggregation.visitors(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')

def browsers(request, account_id, site_id, start_date, end_date):
    """Fetch browsers from a site within the given interval of dates."""
    response = aggregation.browsers(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')
