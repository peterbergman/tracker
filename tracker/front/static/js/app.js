$(function() {
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
            chartColors: [{
                color: '#F7464A',
                highLight: '#FF5A5E'
            }, {
                color: '#368DBA',
                highLight: '#44ADE3'
            }, {
                color: '#FDB45C',
                highLight: '#FFC870'
            }],
            debug: {
                accountId: 'edbdf639f813482c986e2c4a536ec3fb',
                siteId: '627ebf16104240b28c8f2e25ed436655',
                startDate: '2015-02-01',
                endDate: '2015-02-15'
            }
        },
        init: function() {
            $.cookie.json = true;
            var bodyClass = $('body').attr('class');
            if (bodyClass == 'login') {
                $('.form-signin').on('submit', function(event) {
                    App.loginButtonListener(event);
                });
            } else if (bodyClass == 'page-views') {
                App.loadPageViews();
                App.setLoggedInData();
            } else if (bodyClass == 'visitors') {
                App.loadVisitors();
                App.setLoggedInData();
            } else if (bodyClass == 'browsers') {
                App.loadBrowsers();
                App.setLoggedInData();
            }
        },
        loginButtonListener: function(event) {
            event.preventDefault();
            var username = $('#inputEmail').first().val();
            var password = $('#inputPassword').first().val();
            App.sendApiRequest(App.getApiAccountUrl(App.constants.api.protocol,
                    App.constants.api.host, App.constants.api.port, App.constants.debug.accountId),
                'GET', {
                    'Authorization': Base64.encode(username + ':' + password)
                },
                function(data, statusCode) {
                    if (statusCode == 200) {
                        $.cookie('user_data', data);
                        document.location = 'page_views';
                    } else {
                        console.log('login failed!');
                    }
                });
        },
        getChartCtx: function() {
            return $(App.constants.chartId).get(0).getContext('2d');
        },
        getApiReportUrl: function(protocol, host, port, accountId, siteId, startDate, endDate, report) {
            return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId + '/sites/' + siteId + '/start_date/' + startDate + '/end_date/' + endDate + '/' + report;
        },
        getApiAccountUrl: function(protocol, host, port, accountId) {
            return protocol + '://' + host + ':' + port + '/api/accounts/' + accountId;
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
        createChart: function(chartLabel, labelsArray, dataArray) {
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
            new Chart(App.getChartCtx()).Line(data, {});
        },
        createPieChart: function(charLabel, dataArray) {
            var chart = new Chart(App.getChartCtx()).Pie(dataArray, {
                showTooltips: false,
                legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li style=\"list-style: square; font-size: 16px; color: <%=segments[i].fillColor%>; content: *; font-size: 1.7em; margin-left: -19px; padding-right: 0.25em; position: relative;\"><%if(segments[i].label){%><span style=\"color: #333; font-size: 9px\"><%=segments[i].label%></span><%}%></li><%}%></ul>"
            });
            var legend = chart.generateLegend();
            $('#chart-legend').html(legend);
        },
        sortUrlArray: function(urlArray) {
            urlArray.sort(function(a, b) {
                return b.hits - a.hits;
            });
            return urlArray;
        },
        sortBrowserArray: function(browserArray) {
            browserArray.sort(function(a, b) {
                return b.visitors - a.visitors;
            });
            return browserArray;
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
        aggregateVisitorsPerBrowser: function(data) {
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
        },
        populateUrlPageViewTable: function(data) {
            var urls = App.aggregatePageViewsPerUrl(data);
            var urlArray = [];
            for (var url in urls) {
                urlArray.push({
                    'url': url,
                    'hits': urls[url]
                });
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
        populateBrowserVisitorTable: function(data) {
            var browserVisitorsTable = '<table class="table table-striped"><thead><tr><th>Browser</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th class="right-text">Visitors</th></tr></thead><tbody>';
            for (var index in data) {
                browserVisitorsTable += '<tr>' + '<td>' + data[index].browser + '</td>';
                browserVisitorsTable += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
                browserVisitorsTable += '<td class="right-text">' + data[index].visitors + '</td></tr>'
            }
            browserVisitorsTable += '</tbody></table>';
            $('.table-responsive').html(browserVisitorsTable)
        },
        populateBrowserChart: function(data) {
            var dataArray = [];
            var browserCount = (data.length > 3 ? 3 : data.length);
            for (var index in data) {
                dataArray.push({
                    value: data[index].visitors,
                    color: App.constants.chartColors[index].color,
                    highlight: App.constants.chartColors[index].highLight,
                    label: data[index].browser
                })
            }
            App.createPieChart('Browsers', dataArray);
        },
        setLoggedInData: function() {
            var userData = $.cookie('user_data')
            App.setEmail(userData.email);
            App.setSites(userData.sites);
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
        },
        loadPageViews: function() {
            App.sendApiRequest(App.getApiReportUrl(App.constants.api.protocol,
                    App.constants.api.host, App.constants.api.port,
                    App.constants.debug.accountId,
                    App.constants.debug.siteId,
                    App.constants.debug.startDate,
                    App.constants.debug.endDate,
                    App.constants.reports.pageViews),
                'GET', {},
                function(data) {
                    App.populateUrlPageViewTable(data);
                    App.populatePageViewChart(data);
                });
        },
        loadVisitors: function() {
            App.sendApiRequest(App.getApiReportUrl(App.constants.api.protocol,
                    App.constants.api.host, App.constants.api.port,
                    App.constants.debug.accountId,
                    App.constants.debug.siteId,
                    App.constants.debug.startDate,
                    App.constants.debug.endDate,
                    App.constants.reports.visitors),
                'GET', {},
                function(data) {
                    App.populateDateVisitorTable(data);
                    App.populateVisitorChart(data);
                });
        },
        loadBrowsers: function() {
            App.sendApiRequest(App.getApiReportUrl(App.constants.api.protocol,
                    App.constants.api.host, App.constants.api.port,
                    App.constants.debug.accountId,
                    App.constants.debug.siteId,
                    App.constants.debug.startDate,
                    App.constants.debug.endDate,
                    App.constants.reports.browsers),
                'GET', {},
                function(data) {
                    var browsers = App.aggregateVisitorsPerBrowser(data);
                    var browserArray = [];
                    for (var browser in browsers) {
                        browserArray.push({
                            'browser': browser,
                            'visitors': browsers[browser]
                        });
                    }
                    App.sortBrowserArray(browserArray);
                    App.populateBrowserVisitorTable(browserArray);
                    App.populateBrowserChart(browserArray);
                });
        }
    }
    App.init();
});


var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },
}
