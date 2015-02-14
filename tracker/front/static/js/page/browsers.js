define(['jquery', 'constants', 'helpers', 'jquery_cookie', 'bootstrap'], function($, constants, helpers){

  loadBrowsers = function() {
    helpers.sendApiRequest(helpers.getApiReportUrl(constants.api.protocol,
      constants.api.host,
      constants.api.port,
      constants.debug.accountId,
      constants.debug.siteId,
      constants.debug.startDate,
      constants.debug.endDate,
      constants.reports.browsers),
      'GET', {},
      function(data) {
        var browsers = aggregateVisitorsPerBrowser(data);
        var browserArray = [];
        for (var browser in browsers) {
          browserArray.push({
            'browser': browser,
            'visitors': browsers[browser]
          });
        }
        helpers.sortBrowserArray(browserArray);
        populateBrowserVisitorTable(browserArray);
        populateBrowserChart(browserArray);
      });
    }

    aggregateVisitorsPerBrowser = function(data) {
      var browsers = {};
      for (var dateIndex in data.sites[0].dates) {
        var date = data.sites[0].dates[dateIndex];
        for (var browserIndex in date.data.browsers) {
          var browser = date.data.browsers[browserIndex].browser;
          var visitors = date.data.browsers[browserIndex].total;
          var aggregatedVisitors = browsers[browser];
          if (typeof aggregatedVisitors == 'undefined') {
            browsers[browser] = visitors;
          } else {
            browsers[browser] += visitors;
          }
        }
      }
      return browsers;
    }

    populateBrowserVisitorTable = function(data) {
      var browserVisitorsTable = '<table class="table table-striped"><thead><tr><th>Browser</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Visitors</th></tr></thead><tbody>';
      for (var index in data) {
        browserVisitorsTable += '<tr>' + '<td>' + data[index].browser + '</td>';
        browserVisitorsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        browserVisitorsTable += '<td class="right-text">' + data[index].visitors + '</td></tr>'
      }
      browserVisitorsTable += '</tbody></table>';
      $('.table-responsive').html(browserVisitorsTable)
    }

    populateBrowserChart = function(data) {
      var dataArray = [];
      var browserCount = (data.length > 3 ? 3 : data.length);
      for (var index in data) {
        dataArray.push({
          value: data[index].visitors,
          color: constants.chartColors[index].color,
          highlight: constants.chartColors[index].highLight,
          label: data[index].browser
        })
      }
      helpers.createPieChart('Browsers', dataArray);
    }

    loadBrowsers();
    helpers.setLoggedInData();
    $('.logout').on('click', function() {
      logoutListener();
    });

  })
