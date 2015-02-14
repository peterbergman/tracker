define(['jquery', 'jquery_cookie', 'bootstrap', 'constants', 'helpers', 'base64'], function($, cookie, bootstrap, constants, helpers, Base64){

  loginListener = function(event) {
    event.preventDefault();
    var username = $('#inputEmail').first().val();
    var password = $('#inputPassword').first().val();
    helpers.sendApiRequest(helpers.getApiAccountUrl(constants.api.protocol,
      constants.api.host, constants.api.port, constants.debug.accountId),
      'GET', {
        'Authorization': Base64.encode(username + ':' + password)
      },
      function(data, statusCode) {
        if (statusCode == 200) {
          $.cookie('user_data', data);
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
