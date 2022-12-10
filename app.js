var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db=require('./Config/Connection')
var hbs=require('hbs')
var session=require('express-session')
require('dotenv').config()




var UserRouter = require('./routes/User');
var AdminRouter = require('./routes/Admin');
var flash=require('connect-flash');
const { Script } = require('vm');

var app = express();

const partialspath=path.join(__dirname,"views/partials")
const viewpath= path.join(__dirname,"views")
// view engine setup
app.set('view engine', 'hbs');
app.set('views',viewpath);
hbs.registerPartials(partialspath)
// ,usersDir:__dirname+'/views/User'









app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"key",cookie:{maxAge:600000000}}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())
db.connect((error)=>{
  if(error) {
    console.log("Connection error");
  }else{
    console.log("database Connnected");
  }
})
app.use('/', UserRouter);
app.use('/admin', AdminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
