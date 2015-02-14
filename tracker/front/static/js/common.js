requirejs.config({
  baseUrl: '/static/js',
  shim : {
    "bootstrap" : { "deps" :['jquery'] }
  },
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min',
    bootstrap: 'lib/bootstrap',
    jquery_cookie: 'lib/jquery.cookie',
    chartjs: 'lib/chart',
    constants: 'constants',
    helpers: 'helpers',
    base64: 'lib/base64'
  }
})
