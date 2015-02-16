define(['jquery', 'constants', 'helpers', 'jquery_cookie', 'bootstrap'], function($, constants, helpers){

  populateSiteTagTextArea = function() {
    var accountId = helpers.getAccountId();
    var siteId = helpers.getSites()[helpers.getSites().length-1].site_id;
    $('#site-tag').val('<script type="text/javascript">\n'+
    '\ttracker = {accountId: \''+accountId+'\', siteId: \''+siteId+'\'};\n'+
    '\t(function () {\n'+
    '\t\tvar t = document.createElement(\'script\');\n'+
    '\t\tt.type = \'text/javascript\';\n'+
    '\t\tt.async = true;\n'+
    '\t\tt.src = \'http://ec2-54-172-75-176.compute-1.amazonaws.com/static/js/tracker.js\';\n'+
    '\t\tvar a = document.getElementsByTagName(\'script\')[0];\n'+
    '\t\ta.parentNode.insertBefore(t, a);\n'+
    '\t} ());\n'+
    '</script>');
  }

  createSiteListener = function(event) {
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
        populateSiteTagTextArea();
      } else {
        console.log('could not create site!');
      }
    });
  }

  helpers.setEmail(helpers.getEmail());
  $('#create-site').on('click', function(event) {
    createSiteListener(event);
  });
  $('.logout').on('click', function() {
    helpers.logoutListener();
  });

})
