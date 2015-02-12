$(function(){
  App = {
    constants: {
      chartId: '#chart',
      api: {
        host: 'localhost',
        port: 8000,
        protocol: 'http',
      },
      reports: {
        pageViews: 'page_views',
        visitors: 'visitors',
        browsers: 'browsers'
      },
      debug: {
        accountId: 'edbdf639f813482c986e2c4a536ec3fb',
        siteId: '627ebf16104240b28c8f2e25ed436655',
        startDate: '2015-02-01',
        endDate: '2015-02-12'
      }
    },
    init: function() {
      var bodyClass = $('body').attr('class');
      if (bodyClass == 'page-views') {
        App.loadPageViews();
      } else if (bodyClass == 'visitors') {
        App.loadVisitors();
      } else if (bodyClass == 'browsers') {
        App.loadBrowsers();
      }
    },
    getChartCtx: function() {
      return $(App.constants.chartId).get(0).getContext('2d');
    },
    getApiUrl: function(protocol, host, port, accountId, siteId, startDate, endDate, report) {
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
    },
    sendApiRequest: function(accountId, siteId, startDate, endDate, report, callback) {
      $.ajax({
        url: App.getApiUrl(App.constants.api.protocol,
          App.constants.api.host, App.constants.api.port,
          accountId,
          siteId,
          startDate,
          endDate,
          report),
        }).done(function(data, textStatus, jqXHR) {
          callback(data);
        });
      },
      createChart: function(chartLabel, labelsArray, dataArray) {
        var data = {
          labels: labelsArray,
          datasets: [
            {
              label: chartLabel,
              fillColor: 'rgba(151,187,205,0.2)',
              strokeColor: 'rgba(151,187,205,1)',
              pointColor: 'rgba(151,187,205,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(151,187,205,1)',
              data: dataArray
            }
          ]
        };
        var myLineChart = new Chart(App.getChartCtx()).Line(data, {});
      },
      sortUrlArray: function(urlArray) {
        urlArray.sort(function(a, b) {
          return b.hits - a.hits;
        });
        return urlArray;
      },
      aggregatePageViewsPerUrl: function(data) {
        var urls = {};
        for (var dateIndex in data.sites[0].dates) {
          var date = data.sites[0].dates[dateIndex];
          for (var pageIndex in date.data.page_views.pages) {
            var url = date.data.page_views.pages[pageIndex].page_url;
            var pageViews = date.data.page_views.pages[pageIndex].page_views;
            var aggregatedPageViews = urls[url];
            if (typeof aggregatedPageViews == 'undefined') {
              urls[url] = pageViews;
            } else {
              urls[url] += pageViews;
            }
          }
        }
        return urls;
      },
      populateUrlPageViewTable: function(data) {
        var urls = App.aggregatePageViewsPerUrl(data);
        var urlArray = [];
        for (var url in urls) {
          urlArray.push({'url': url, 'hits': urls[url]});
        }
        App.sortUrlArray(urlArray);
        var urlHitsTable = '<table class="table table-striped"><thead><tr><th>URL</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Hits</th></tr></thead><tbody>';
        for (var index in urlArray) {
          urlHitsTable += '<tr>' + '<td>' + urlArray[index].url + '</td>';
          urlHitsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
          urlHitsTable += '<td class="right-text">' + urlArray[index].hits + '</td></tr>'
        }
        urlHitsTable += '</tbody></table>';
        $('.table-responsive').html(urlHitsTable)
      },
      populatePageViewChart: function(data) {
        var labelsArray = [];
        for (var index in data.sites[0].dates) {
          labelsArray.push(data.sites[0].dates[index].date);
        }
        var dataArray = [];
        for (var index in data.sites[0].dates) {
          dataArray.push(data.sites[0].dates[index].data.page_views.total);
        }
        App.createChart('Page views', labelsArray, dataArray);
      },
      populateDateVisitorTable: function(data) {
        var dateVisitorsTable = '<table class="table table-striped"><thead><tr><th>Date</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Visitors</th></tr></thead><tbody>';
        for (var dateIndex in data.sites[0].dates) {
          dateVisitorsTable += '<tr>' + '<td>' + data.sites[0].dates[dateIndex].date + '</td>';
          dateVisitorsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
          dateVisitorsTable += '<td class="right-text">' + data.sites[0].dates[dateIndex].data.visitors + '</td></tr>'
        }
        dateVisitorsTable += '</tbody></table>';
        $('.table-responsive').html(dateVisitorsTable)
      },
      populateVisitorChart: function(data) {
        var labelsArray = [];
        for (var index in data.sites[0].dates) {
          labelsArray.push(data.sites[0].dates[index].date);
        }
        var dataArray = [];
        for (var index in data.sites[0].dates) {
          dataArray.push(data.sites[0].dates[index].data.visitors);
        }
        App.createChart('Visitors', labelsArray, dataArray);
      },
      loadPageViews: function() {
        App.sendApiRequest(App.constants.debug.accountId,
          App.constants.debug.siteId,
          App.constants.debug.startDate,
          App.constants.debug.endDate,
          App.constants.reports.pageViews,
          function(data){
            App.populateUrlPageViewTable(data);
            App.populatePageViewChart(data);
          });
        },
        loadVisitors: function() {
          App.sendApiRequest(App.constants.debug.accountId,
            App.constants.debug.siteId,
            App.constants.debug.startDate,
            App.constants.debug.endDate,
            App.constants.reports.visitors,
            function(data){
              App.populateDateVisitorTable(data);
              App.populateVisitorChart(data);
            });
        },
        loadBrowsers: function() {
          console.log('loading browsers..');
        }
      }
      App.init();
    });
