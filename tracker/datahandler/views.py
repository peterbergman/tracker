from django.http import HttpResponse

def delegate_request(request):
    if request.method == 'GET':
        return handle_get(request)
    else:
        return handle_unsupported_method(request)

def handle_get(request):
    return HttpResponse(status=200)

def handle_unsupported_method(request):
    return HttpResponse(status=400)
