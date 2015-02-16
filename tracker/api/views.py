from django.http import HttpResponse
from api.models import *
from datetime import datetime
from django.conf import settings
from bson.json_util import dumps
import jsonpickle
import json
import base64
import sys
from django.http import QueryDict
from helper import aggregation

def get_account(request, value):
    print('get_account')
    print('value:' + value)
    """Fetch and existing account from the database."""
    if '@' not in value:
        key = 'account_id'
    else:
        key = 'email'
    auth_header = get_auth_header(request)
    if auth_header == None:
        response = HttpResponse(content_type='application/json', status=403)
    else:
        auth_string = str(base64.b64decode(auth_header))
        username = get_username_from_auth_string(auth_string)
        password = get_password_from_auth_string(auth_string)
        print('username: ' + username)
        print('password: ' + password)
        print('key: ' + key)
        result = settings.DB.account.find({key : username, 'password': password}, {'password': False, '_id': False});
        if result.count() == 0:
            response = HttpResponse(content_type='application/json', status=404)
        else:
            response = HttpResponse(content_type='application/json')
            response.content = dumps(result[0])
    return response

def get_or_update_account(request, value):
    """Delegate a request to create or update an account the the correct handler function."""
    if request.method == 'GET':
        return get_account(request, value)
    elif request.method == 'PUT':
        return update_account(request, value)

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

def update_account(request, value):
    print('update_account')
    print('value:' + value)
    """Update an existing account in the database."""
    auth_header = get_auth_header(request)
    if auth_header == None:
        response = HttpResponse(content_type='application/json', status=403)
    else:
        auth_string = str(base64.b64decode(auth_header))
        password = get_password_from_auth_string(auth_string)
        result = settings.DB.account.find({'account_id' : value, 'password': password}, {'password': False, '_id': False});
        if result.count() == 0:
            response = HttpResponse(content_type='application/json', status=404)
        else:
            response = HttpResponse()
            site_name = parse_site_name(request)
            account = result[0]
            sites = account['sites']
            site = Site(site_name)
            sites.append(site)
            json_str = jsonpickle.encode(account, unpicklable=False)
            settings.DB.account.update({'account_id' : account['account_id']}, json.loads(json_str))

    return response

def parse_email(request):
    """Parse the email from the POST or PUT request variables."""
    if request.method == 'POST':
        return request.POST.get('email')
    elif request.method == 'PUT':
        variables = QueryDict(request.body)
        return variables.get('email')

def parse_password(request):
    """Parse the password from the POST or PUT request variables."""
    if request.method == 'POST':
        return request.POST.get('password')
    elif request.method == 'PUT':
        variables = QueryDict(request.body)
        return variables.get('password')

def parse_site_name(request):
    """Parse the site name from the POST or PUT request variables."""
    if request.method == 'POST':
        return request.POST.get('site_name')
    elif request.method == 'PUT':
        variables = QueryDict(request.body)
        return variables.get('site_name')

def get_auth_header(request):
    return request.META.get('HTTP_AUTHORIZATION')

def get_username_from_auth_string(auth_string):
    return split_auth_string(auth_string)[0]

def get_password_from_auth_string(auth_string):
    return split_auth_string(auth_string)[1]

def split_auth_string(auth_string):
    if sys.version_info < (3, 0, 0):
        return auth_string.split(':')
    else:
        return auth_string[2:-1].split(':')

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
