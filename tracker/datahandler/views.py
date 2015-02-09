from django.http import HttpResponse
from datahandler.models import Event
import uuid

def delegate_request(request, account_id, site_id):
    if request.method == 'GET':
        return handle_get(request, account_id, site_id)
    else:
        return handle_unsupported_method(request)

def handle_get(request, account_id, site_id):
    visitor_id = parse_visitor_id(request)
    page_url = parse_page_url(request)
    user_agent = parse_user_agent(request)
    event = Event(account_id=account_id, site_id=site_id, visitor_id=visitor_id, page_url=page_url, user_agent=user_agent).save()
    print(event)

    return HttpResponse(status=200)

def handle_unsupported_method(request):
    return HttpResponse(status=400)

def parse_visitor_id(request):
    visitor_id = request.COOKIES.get('visitor_id')
    if visitor_id == None:
        visitor_id = uuid.uuid4().hex
    return visitor_id

def parse_page_url(request):
    page_url = request.GET.get('page_url')
    if page_url == None:
        page_url = 'None'
    return page_url

def parse_user_agent(request):
    user_agent = request.META.get('HTTP_USER_AGENT')
    if user_agent == None:
        user_agent = 'None'
    return user_agent
