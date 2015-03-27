'use strict';

var db = require('./database.js').db;
var users = db.get('users');

var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

module.exports = function(app){

  app.get('/',function(req, res, next){
    console.log('hello');
    if (req.user || req.session.passport !== {}) {
      console.log('in the checkUser utility function, about to execute next()');
      next();
    } else {
      console.log('in the checkUser utility function, about to have the response object send "0"');
      res.send('0');
    }
  });

  passport.serializeUser(function(user, done){
    console.log('user about to be serialized', user);
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
    clientID: '9383eeff63778d471150',
    clientSecret: 'e4e1ed909f1a2063fd4606adae6636b995229010',
    callbackURL: 'http://localhost:3000/auth/github/callback'

    // Begin Authentication Callback 

  }, function(accessToken, refreshToken, profile, done){

      // Logging for Testing

      console.log('accessToken', accessToken);
      console.log('profile', profile);

      // Find Document with matching userid and then save access token

      users.findOne({userid: profile.id}).on('success', function (doc) {
        if (!doc){
          doc = {};
          doc.userid = profile.id;
        }
        doc.accessToken = accessToken;
        console.log('THIS IS THE DOC', doc);
        return done(null, profile);
      });

      // For Testing

    //   process.nextTick(function () {
    //      return done(null, profile);
    //   });
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
