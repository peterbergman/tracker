$(function(){
  App = {
    constants: {
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
        endDate: '2015-02-11'
      }
    },
    init: function() {
      var bodyClass = $('body').attr('class');
      if (bodyClass == 'page_views') {
        App.loadPageViews();
      } else if (bodyClass == 'visitors') {
        App.loadVisitors();
      } else if (bodyClass == 'browsers') {
        App.loadBrowsers();
      }
    },
    loadPageViews: function() {
      console.log('loading page views...');
      $.ajax({
        url: App.getApiUrl(App.constants.api.protocol,
                App.constants.api.host, App.constants.api.port,
                App.constants.debug.accountId,
                App.constants.debug.siteId,
                App.constants.debug.startDate,
                App.constants.debug.endDate,
                App.constants.reports.pageViews),

      }).done(function(data, textStatus, jqXHR) {
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
        var urlHitsTable = '<table class="table table-striped"><thead><tr><th>URL</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right_text">Hits</th></tr></thead><tbody>';
        for (url in urls) {
          urlHitsTable += '<tr>' + '<td>' + url + '</td>';
          urlHitsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
          urlHitsTable += '<td class="right_text">' + urls[url] + '</td></tr>'
        }
        urlHitsTable += '</tbody></table>';
        $('.table-responsive').html(urlHitsTable)
      })
    },
    loadVisitors: function() {
      console.log('loading visitors...');
    },
    loadBrowsers: function() {
      console.log('loading browsers..');
    },
    getApiUrl: function(protocol, host, port, accountId, siteId, startDate, endDate, report) {
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
    }
  }
  App.init();
});
