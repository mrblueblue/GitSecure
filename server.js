/* Import node's http module: */
var http = require("http");
var _ = require("underscore");
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');
var app = express();
var mainExecution = require("./app");
var util = require("./utilities");

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('example app listening at http://%s:%s', host, port);
});

app.use(bodyParser.json());
app.use(cors());

app.use(session({
  secret: 'nyan cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { successRedirect: '/',
                                      failureRedirect: '/login' }));

// Serve Angular App
app.use(express.static(__dirname + '/client/'));

app.get('/numbers', function(req,res){
  var counts = util.getCounts();
  res.send(201, counts);
});

app.post('/', function(req,res) {
});



