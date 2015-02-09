from django.http import HttpResponse
from datahandler.models import Event
import datetime
import time
import uuid

def delegate_request(request, account_id, site_id):
    """Delegate a request by calling the correct handler."""
    if request.method == 'GET':
        return handle_get(request, account_id, site_id)
    else:
        return handle_unsupported_method(request)

def handle_get(request, account_id, site_id):
    """Handle GET request.

    Reads information from the request and creates a new event entry that is stored in the database.
    """
    visitor_id = parse_visitor_id(request)
    page_url = parse_page_url(request)
    user_agent = parse_user_agent(request)
    event = Event(account_id=account_id, site_id=site_id, visitor_id=visitor_id, page_url=page_url, user_agent=user_agent).save()
    return create_response(visitor_id)

def handle_unsupported_method(request):
    """Handle unsupported methods by returning 400 Bad request."""
    return HttpResponse(status=400)

def parse_visitor_id(request):
    """Parse the visitor_id by reading the visitor_id cookie value. If no visitor_id cookie is present, create a new visitor_id."""
    visitor_id = request.COOKIES.get('visitor_id')
    if visitor_id == None:
        visitor_id = uuid.uuid4().hex
    return visitor_id

def parse_page_url(request):
    """Parse the page_url by reading the page_url parameter from the request URL. If no page_url parameter is present, use value 'None'."""
    page_url = request.GET.get('page_url')
    if page_url == None:
        page_url = 'None'
    return page_url

def parse_user_agent(request):
    """Parse the user_agent by reading the HTTP_USER_AGENT from the request metadata. If no user_agent is present, use value 'None'."""
    user_agent = request.META.get('HTTP_USER_AGENT')
    if user_agent == None:
        user_agent = 'None'
    return user_agent

def create_response(visitor_id):
    """Create the HttpResponse that sets the visitor_id cookie when sent back to the client."""
    response = HttpResponse()
    expire_time = datetime.datetime.fromtimestamp(time.time() + 157784630)
    response.set_cookie('visitor_id', value=visitor_id, expires=expire_time)
    return response
