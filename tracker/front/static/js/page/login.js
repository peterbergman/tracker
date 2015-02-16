define(['jquery', 'jquery_cookie', 'bootstrap', 'constants', 'helpers', 'base64'], function($, cookie, bootstrap, constants, helpers, Base64){

  loginListener = function(event) {
    event.preventDefault();
    var username = $('#inputEmail').first().val();
    var password = $('#inputPassword').first().val();
    var authHeader = Base64.encode(username + ':' + password);
    helpers.sendApiRequest(helpers.getApiAccountUrl(username),
      'GET', {
        'Authorization': authHeader
      }, {},
      function(data, statusCode) {
        if (statusCode == 200) {
          data.auth = authHeader;
          $.cookie('user_data', data, {path: '/'});
          document.location = 'page_views';
        } else {
          console.log('login failed!');
        }
      });
    }

    $('.form-signin').on('submit', function(event) {
      loginListener(event);
    });
  })
