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
    getApiUrl: function(protocol, host, port, accountId, siteId, startDate, endDate, report) {
      return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
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
      var urlHitsTable = '<table class="table table-striped"><thead><tr><th>URL</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right_text">Hits</th></tr></thead><tbody>';
      for (var index in urlArray) {
        urlHitsTable += '<tr>' + '<td>' + urlArray[index].url + '</td>';
        urlHitsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        urlHitsTable += '<td class="right_text">' + urlArray[index].hits + '</td></tr>'
      }
      urlHitsTable += '</tbody></table>';
      $('.table-responsive').html(urlHitsTable)
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
        App.populateUrlPageViewTable(data);
      })
    },
    loadVisitors: function() {
      console.log('loading visitors...');
    },
    loadBrowsers: function() {
      console.log('loading browsers..');
    }
  }
  App.init();
});
