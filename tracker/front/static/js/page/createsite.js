define(['jquery', 'constants', 'helpers', 'jquery_cookie', 'bootstrap'], function($, constants, helpers){

  createSiteListener = function() {
    event.preventDefault();
    var authHeader = helpers.getAuth();
    var accountId = helpers.getAccountId();
    var selectedSite = helpers.getSelectedSite();
    var siteName = $('#site-name').val();
    var data = {'site_name': siteName};
    helpers.sendApiRequest(helpers.getApiAccountUrl(accountId),
    'PUT', {
      'Authorization': authHeader
    },
    data,
    function(data, statusCode) {
      if (statusCode == 200) {
        data.auth = authHeader;
        data.selected_site = selectedSite;
        $.cookie('user_data', data, {path: '/'});
      } else {
        console.log('login failed!');
      }
    });
  }

  helpers.setEmail(helpers.getEmail());

  $('#site-name').on('click', function() {
    createSiteListener();
  });

  $('.logout').on('click', function() {
    helpers.logoutListener();
  });

})
