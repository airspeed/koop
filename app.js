var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var album = require('./routes/album');
var form = require('./routes/form');
var overview = require('./routes/overview');
var done = require('./routes/done');

var app = express();

/*
 * ==========================
 * Constants
 * ==========================
 */
CLIENT_ID = 'cef23f7912af4b3a6629ff342f121233';
CLIENT_SECRET = '904efb802e1c5bed30976b50b067875878';
PDF_PATH = 'public/redbull.pdf';// fotobuch that can be ordered with this app.
API_VERSION = 'v1.1.5';
REQUEST_LOCALE = 'de_DE';
//API_HOST = 'fotobuch-api-dev.clixxie.de';
API_HOST = 'fotobuch-api.clixxie.de';
PRODUCT_CODE = 'CLXB5S2Q';
PAYMENT_TYPE_ID_PAYPAL = 2;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/album', album);
app.use('/form', form);
app.use('/overview', overview);
app.use('/done', done);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
