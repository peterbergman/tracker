define(['jquery', 'constants', 'helpers', 'jquery_cookie', 'bootstrap'], function($, constants, helpers){

  sortUrlArray = function(urlArray) {
    urlArray.sort(function(a, b) {
      return b.hits - a.hits;
    });
    return urlArray;
  }

  loadPageViews = function() {
    helpers.sendApiRequest(helpers.getApiReportUrl(helpers.getAccountId(),
      helpers.getSelectedSite(),
      constants.debug.startDate,
      constants.debug.endDate,
      constants.reports.pageViews),
      'GET', {}, {},
      function(data) {
        if (data.sites[0].dates.length == 0) {
          helpers.showNoData();
        } else {
          $('.report-sub-header').show();
          populateUrlPageViewTable(data);
          populatePageViewChart(data);
        }
      });
    }

    populateUrlPageViewTable = function(data) {
      var urls = aggregatePageViewsPerUrl(data);
      var urlArray = [];
      for (var url in urls) {
        urlArray.push({
          'url': url,
          'hits': urls[url]
        });
      }
      sortUrlArray(urlArray);
      var urlHitsTable = '<table class="table table-striped"><thead><tr><th>URL</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Hits</th></tr></thead><tbody>';
      for (var index in urlArray) {
        urlHitsTable += '<tr>' + '<td>' + urlArray[index].url + '</td>';
        urlHitsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        urlHitsTable += '<td class="right-text">' + urlArray[index].hits + '</td></tr>'
      }
      urlHitsTable += '</tbody></table>';
      $('.table-responsive').html(urlHitsTable)
    }

    populatePageViewChart = function(data) {
      var labelsArray = [];
      for (var index in data.sites[0].dates) {
        labelsArray.push(data.sites[0].dates[index].date);
      }
      var dataArray = [];
      for (var index in data.sites[0].dates) {
        dataArray.push(data.sites[0].dates[index].data.page_views.total);
      }
      helpers.createLineChart('Page views', labelsArray, dataArray);
    }

    aggregatePageViewsPerUrl = function(data) {
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
    }

    helpers.setLoggedInData();
    $('.logout').on('click', function() {
      helpers.logoutListener();
    });

    loadPageViews();
  })
