from django.http import HttpResponse
from api.models import *
from datetime import datetime
from django.conf import settings
from bson.json_util import dumps
import jsonpickle
import json
from helper import aggregation

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
    response = aggregation.page_views(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')

def visitors(request, account_id, site_id, start_date, end_date):
    response = aggregation.visitors(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')

def browsers(request, account_id, site_id, start_date, end_date):
    response = aggregation.browsers(account_id, site_id, start_date, end_date)
    return HttpResponse(dumps(response), content_type='application/json')
