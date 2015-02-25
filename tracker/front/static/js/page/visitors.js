define(['jquery', 'appData', 'helpers', 'jquery_cookie', 'bootstrap', 'datepicker'], function($, appData, helpers){

  $('.input-daterange').datepicker({
    format: "yyyy-mm-dd",
    weekStart: 1
  });

  $('[name=start]').datepicker('update', helpers.getDate(-3));
  $('[name=end]').datepicker('update', helpers.getDate(3));

  $('[name="start"]').on('changeDate', function(event){
    helpers.dateListener(event, 'startDate', loadVisitors);
  });

  $('[name="end"]').on('changeDate', function(event){
    helpers.dateListener(event, 'endDate', loadVisitors);
  });

  loadVisitors = function(startDate, endDate) {
    if (typeof helpers.getSelectedSite() == 'undefined') {
      helpers.showNoSiteSelected();
    } else {
      helpers.sendApiRequest(helpers.getApiReportUrl(helpers.getAccountId(),
      helpers.getSelectedSite().site_id,
      startDate,
      endDate,
      appData.reports.visitors),
      'GET', {}, {},
      function(data) {
        if (data.sites[0].dates.length == 0) {
          helpers.showNoData();
        } else {
          $('.report-sub-header').show();
          populateDateVisitorTable(data);
          populateVisitorChart(data);
        }
      });
    }
  }

  populateDateVisitorTable = function(data) {
    $('.table-responsive').html('');
    var dateVisitorsTable = '<table class="table table-striped"><thead><tr><th>Date</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Visitors</th></tr></thead><tbody>';
    for (var dateIndex in data.sites[0].dates) {
      dateVisitorsTable += '<tr>' + '<td>' + data.sites[0].dates[dateIndex].date + '</td>';
      dateVisitorsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
      dateVisitorsTable += '<td class="right-text">' + data.sites[0].dates[dateIndex].data.visitors + '</td></tr>'
    }
    dateVisitorsTable += '</tbody></table>';
    $('.table-responsive').html(dateVisitorsTable)
  }

  populateVisitorChart = function(data) {
    var labelsArray = [];
    for (var index in data.sites[0].dates) {
      labelsArray.push(data.sites[0].dates[index].date);
    }
    var dataArray = [];
    for (var index in data.sites[0].dates) {
      dataArray.push(data.sites[0].dates[index].data.visitors);
    }
    helpers.createLineChart('Visitors', labelsArray, dataArray);
  }

  helpers.setLoggedInData();
  $('.logout').on('click', function() {
    helpers.logoutListener();
  });

  loadVisitors(helpers.getDate(-3), helpers.getDate(3));
})
