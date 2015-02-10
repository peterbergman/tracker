from django.shortcuts import render_to_response

def page_views(request):
    return render_to_response('page_views.html')

def visitors(request):
    return render_to_response('visitors.html')

def browsers(request):
    return render_to_response('browsers.html')
