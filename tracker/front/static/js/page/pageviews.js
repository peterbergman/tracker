define(['jquery', 'appData', 'helpers', 'jquery_cookie', 'bootstrap', 'datepicker'], function($, appData, helpers){

  $('.input-daterange').datepicker({
    format: "yyyy-mm-dd",
    weekStart: 1
  });

  $('[name="start"]').on('changeDate', function(event){
    dateListener(event, 'startDate');
  });

  $('[name="end"]').on('changeDate', function(event){
    dateListener(event, 'endDate');
  });

  dateListener = function(event, type) {
    var date = parseDate(event.date);
    if (appData.date[type] != date) {
      appData.date[type] = date;
    }
    if (typeof appData.date.startDate != 'undefined'
    && typeof appData.date.endDate != 'undefined'
    && event.timeStamp - appData.date.dateChangeTimeStamp > 100) {
      appData.date.dateChangeTimeStamp = event.timeStamp;
      loadPageViews(appData.date.startDate, appData.date.endDate);
    }
  }

  parseDate = function(date) {
    var options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };
    var dateString = date.toLocaleTimeString('sv', options);
    return dateString.substring(0, dateString.indexOf(' '));
  }

  sortUrlArray = function(urlArray) {
    urlArray.sort(function(a, b) {
      return b.hits - a.hits;
    });
    return urlArray;
  }

  loadPageViews = function(startDate, endDate) {
    if (typeof helpers.getSelectedSite() == 'undefined') {
      helpers.showNoSiteSelected();
    } else {
      helpers.sendApiRequest(helpers.getApiReportUrl(helpers.getAccountId(),
      helpers.getSelectedSite().site_id,
      startDate,
      endDate,
      appData.reports.pageViews),
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
  }

  populateUrlPageViewTable = function(data) {
    $('.table-responsive').html('');
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

  loadPageViews('2015-02-01', '2015-02-20');
})
