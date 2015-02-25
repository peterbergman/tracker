define(['jquery', 'chartjs', 'constants', 'jquery_cookie'], function($, Chart, constants){
  $.cookie.json = true;
  var helpers = {
    getAuth: function() {
      var userData = $.cookie('user_data');
      if (typeof userData != 'undefined') {
        return userData.auth;
      }
    },
    getAccountId: function() {
      var userData = $.cookie('user_data');
      if (typeof userData != 'undefined') {
        return userData.account_id;
      }
    },
    getEmail: function() {
      var userData = $.cookie('user_data');
      if (typeof userData != 'undefined') {
        return userData.email;
      }
    },
    getSites: function() {
      var userData = $.cookie('user_data');
      if (typeof userData != 'undefined') {
        return userData.sites;
      }
    },
    setSelectedSite: function(site) {
      var userData = $.cookie('user_data');
      userData.selected_site = site;
      $.cookie('user_data', userData, {path: '/'});
    },
    getSelectedSite: function() {
      var userData = $.cookie('user_data');
      if (typeof userData != 'undefined') {
        return userData.selected_site;
      }
    },
    getChartCtx: function() {
      return $(constants.chartId).get(0).getContext('2d');
    },
    getEnvironment: function() {
      if (document.location.host.match('localhost')) {
        return 'development';
      } else {
        return 'production';
      }
    },
    getApiAccountUrl: function(accountId) {
      var env = helpers.getEnvironment();
      var host = (env == 'production' ? constants.api.production.host : constants.api.development.host);
      var port = (env == 'production' ? constants.api.production.port : constants.api.development.port);
      var protocol = (env == 'production' ? constants.api.production.protocol : constants.api.development.protocol);
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId;
    },
    getApiReportUrl: function(accountId, siteId, startDate, endDate, report) {
      var env = helpers.getEnvironment();
      var host = (env == 'production' ? constants.api.production.host : constants.api.development.host);
      var port = (env == 'production' ? constants.api.production.port : constants.api.development.port);
      var protocol = (env == 'production' ? constants.api.production.protocol : constants.api.development.protocol);
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
    },
    sendApiRequest: function(url, requestMethod, headers, data, callback) {
      $.ajax({
        url: url,
        method: requestMethod,
        headers: headers,
        data: data,
      }).done(function(data, textStatus, jqXHR) {
        callback(data, jqXHR.status);
      }).always(function(jqXHROrData, textStatus, jqXHROrErrorThrown) {
        if (textStatus == 'error') {
          callback({}, jqXHROrData.status)
        }
      });
    },
    createLineChart: function(chartLabel, labelsArray, dataArray) {
      if (typeof constants.chart != 'undefined') {
        constants.chart.destroy();
      }
      var data = {
        labels: labelsArray,
        datasets: [{
          label: chartLabel,
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: dataArray
        }]
      };
      constants.chart = new Chart(helpers.getChartCtx()).Line(data, {});
    },
    createPieChart: function(charLabel, dataArray) {
      if (typeof constants.chart != 'undefined') {
        constants.chart.destroy();
      }
      constants.chart = new Chart(helpers.getChartCtx()).Pie(dataArray, {
        showTooltips: false,
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li style=\"list-style: square; font-size: 16px; color: <%=segments[i].fillColor%>; content: *; font-size: 1.7em; margin-left: -19px; padding-right: 0.25em; position: relative;\"><%if(segments[i].label){%><span style=\"color: #333; font-size: 9px\"><%=segments[i].label%></span><%}%></li><%}%></ul>"
      });
      var legend = constants.chart.generateLegend();
      $('#chart-legend').html(legend);
    },
    setLoggedInData: function() {
      helpers.setEmail(helpers.getEmail());
      helpers.setSites(helpers.getSites());
    },
    setEmail: function(email) {
      if (typeof email != 'undefined') {
        $('#email-dropdown').first().html(email + ' <b class="caret"></b>');
      }
    },
    logoutListener: function() {
      $.removeCookie('user_data', {path: '/'});
      document.location = '/';
    },
    siteListener: function(clickedSite) {
      var siteName = $(clickedSite).text();
      var siteId = $(clickedSite).attr('id');
      $('#site-box').val(siteName);
      helpers.setSelectedSite({'site_name': siteName, 'site_id': siteId});
      location.reload();
    },
    setSites: function(sites) {
      var siteDropdown = $('#sites-dropdown').first();
      for (var index in sites) {
        siteDropdown.append('<li id="'+ sites[index].site_id +'"><a href="#">' + sites[index].site_name + '</a></li>');
        $('#sites-dropdown li').eq(index).on('click', function(){
          helpers.siteListener(this);
        });
      }
      siteDropdown.append('<li class="divider"></li><li><a href="/create_site">Create new site</a></li>');
      if (typeof helpers.getSelectedSite() != 'undefined') {
        $('#site-box').val(helpers.getSelectedSite().site_name);
      } else if (typeof sites[0] != 'undefined') {
        $('#site-box').val(sites[0].site_name);
        helpers.setSelectedSite(sites[0]);
      }
    },
    showNoData: function() {
      $('.row .placeholders').html('<div class="lead">No data available for the given dates... :(</div>');
    },
    showNoSiteSelected: function() {
      $('.row .placeholders').html('<div class="lead">No site selected... :(</div>');
    }
  }
  return helpers;
})
