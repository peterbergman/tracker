define(['jquery', 'chartjs', 'constants', 'jquery_cookie'], function($, Chart, constants){
  $.cookie.json = true;
  var helpers = {
    getChartCtx: function() {
      return $(constants.chartId).get(0).getContext('2d');
    },
    getApiAccountUrl: function(protocol, host, port, accountId) {
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId;
    },
    getApiReportUrl: function(protocol, host, port, accountId, siteId, startDate, endDate, report) {
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
    },
    sendApiRequest: function(url, requestMethod, headers, callback) {
      $.ajax({
        url: url,
        method: requestMethod,
        headers: headers,
      }).done(function(data, textStatus, jqXHR) {
        callback(data, jqXHR.status);
      }).always(function(jqXHROrData, textStatus, jqXHROrErrorThrown) {
        if (textStatus == 'error') {
          callback({}, jqXHROrData.status)
        }
      });
    },
    createLineChart: function(chartLabel, labelsArray, dataArray) {
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
      new Chart(helpers.getChartCtx()).Line(data, {});
    },
    createPieChart: function(charLabel, dataArray) {
      var chart = new Chart(helpers.getChartCtx()).Pie(dataArray, {
        showTooltips: false,
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li style=\"list-style: square; font-size: 16px; color: <%=segments[i].fillColor%>; content: *; font-size: 1.7em; margin-left: -19px; padding-right: 0.25em; position: relative;\"><%if(segments[i].label){%><span style=\"color: #333; font-size: 9px\"><%=segments[i].label%></span><%}%></li><%}%></ul>"
      });
      var legend = chart.generateLegend();
      $('#chart-legend').html(legend);
    },
    setLoggedInData: function() {
      var userData = $.cookie('user_data')
      helpers.setEmail(userData.email);
      helpers.setSites(userData.sites);
    },
    setEmail: function(email) {
      $('#email-dropdown').first().html(email + ' <b class="caret"></b>');
    },
    setSites: function(sites) {
      var siteDropdown = $('#sites-dropdown').first();
      for (var index in sites) {
        siteDropdown.append('<li><a href="#">' + sites[index].site_name + '</a></li>');
      }
      siteDropdown.append('<li class="divider"></li><li><a href="#">Create new site</a></li>');
    }
  }
  return helpers;
})
