(function(){
  var pixel = new Image();
  pixel.src = 'http://ec2-54-172-75-176.compute-1.amazonaws.com/datahandler/' + tracker.accountId + '/' + tracker.siteId + '/?page_url=' + (tracker.pageUrl ? tracker.pageUrl : encodeURIComponent(document.location.href));
})()
