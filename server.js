'use strict';

var db = require('./database.js').db;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fileSystemUtilities = require('./server/services/fileSystem/utilities.js');

var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('example app listening at http://%s:%s', host, port);
  // refactored from app.js, cleans out any un-deleted files that may exist in our git_data dir
  console.log('Initializing GitSecure and cleaning from last cycle');
  var pathToData = __dirname + '/git_data';
  fileSystemUtilities.removeDirectorySync(pathToData);
  console.log('system ready to process repos...');
});

app.use(express.static(__dirname + '/client/'));

require('./auth-middleware.js')(app);

app.use(bodyParser.json());

app.get('/numbers', function(req, res){
  res.send(201, {TBD:'0'});
});

// GET route for getting all subscribed repos
// response as an array of repo ids that
// the user has subscribed to
app.get('/repos', function(req, res){
  console.log('This is the request:', req);
  db.findAllReposByUser(req.param('userid'), function(docs) {
    var collection = docs.map(function(doc){
      return doc.id;
    });
    res.status(201).send(collection);
    console.log('This is the response:', res);
  }); 
});

// POST route for sending to DB all repos user wants to subscribe
// req.body is an array of repos
// repos = {
//  userid: userid,
//  repoid: repoid,
//  name: name,
//  html_url: html_url,
//  git_url, git_url,
// }
app.post('/repos', function(req, res){
  console.log('This is the request:', req);
  req.body.forEach(function(repo) {
    db.getOrInsertRepo(repo);
  });
  res.status(201).send('data received. thank you');
  console.log('This is the response:', res);
});

// GET route for retrieving all repos reports for a user
// returns an array
// Repos collection document structure:  
// {"repo_id": 11667865,
// "repo_info": {
//   "git_url": "git://github.com/reactjs/react-rails.git",
//   "name" : "react-rails",
//   "scan_results" : "",
//   "retire_results" : "",
//   "parse_results" : "",
//   }
// }
app.get('/results', function(req, res){
  console.log('This is the request:', req);
  db.findAllReposByUser(req.param('userid'), function(docs) {
    var collection = docs.map(function(doc){
      return delete doc.users;
    });
    res.status(201).send(collection);
    console.log('This is the response:', res);
  }); 
});
