/*

included with tag:

(function () {
        var tracker = document.createElement('script');
        tracker.type = 'text/javascript';
        tracker.async = true;
        tracker.src = http url to script;
        var a = document.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(tracker, a);
    } ());*/(function(){  var pixel = new Image();  pixel.src = 'http://localhost:8000/datahandler/' + tracker.accountId + '/' + tracker.siteId + '/?page_url=' + (tracker.pageUrl ? tracker.pageUrl : encodeURIComponent(document.location.href));})()