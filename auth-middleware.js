'use strict';

var db = require('./database.js').db;
var users = db.get('users');

var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var serverConfig = require('./serverConfig.js');

module.exports = function(app){

  app.get('/',function(req, res, next){
    if (req.user || req.session.passport !== {}) {
      next();
    } else {
      res.send('0');
    }
  });

  passport.serializeUser(function(user, done){
    // console.log('user about to be serialized', user);
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(session({
    saveUninitialized: true, 
    resave: true, 
    secret: 'this is our secret'
  }));

  // Authentication Strategy for Github

  passport.use(new GitHubStrategy({
    clientID: serverConfig.clientID,
    clientSecret: serverConfig.clientSecret,
    callbackURL: serverConfig.callbackURL

    // Begin Authentication Callback 

  }, function(accessToken, refreshToken, profile, done){

      // Logging for Testing

      // console.log('accessToken', accessToken);
      // console.log('profile', profile);

      // Find Document with matching userid and then save access token

      users.findOne({userid: profile.id.toString()}).on('success', function (doc) {
        if (!doc){
          users.insert({
              userid: profile.id.toString(), 
              accessToken: accessToken
          }, function(err) { // ignoring doc
            if (err) {console.error(err);}
            return done(null, profile);
          });
        } else {
          doc.accessToken = accessToken;
          return done(null, profile);
        }
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/github',
    passport.authenticate('github', {scope: 'write:repo_hook'} ));

  app.get('/auth/github/callback', 
    passport.authenticate('github', 
      { sucessRedirect: '/', failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/auth/error', function(req, res){
    console.log('login failed in server');
    res.redirect('/');
  });

  app.get('/loggedin', function(req, res){
    res.send(req.isAuthenticated() ? req.user : 'unauthorized');
  });

};
