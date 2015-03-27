'use strict';

var db = require('./database.js');
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

// GET route for getting all subscribed repos
// response as an array of repo ids that
// the user has subscribed to

app.get('/repos/:userid', function(req, res){
  //console.log('This is the request:', req);
  db.findAllReposByUser(req.params.userid, function(docs) {
    var collection = docs.map(function(doc){
      return doc.id;
    });
    res.status(201).send(collection);
  }); 
});

// POST route for sending to DB all repos user wants to subscribe
// req.body is an array of repos
// repos = {
//  userid: userid,
//  repoid: repoid,
//  name: name,
//  html_url: html_url,
//  git_url: git_url,
//  checked: bool
// }

app.post('/repos/', function(req, res){

  //console.log('This is the request:', req);
  db.findAllReposByUser(req.body[0].userid, function(docs) {
    var serverRepos = docs;
    var clientRepos = req.body;
    var checkedClientRepos = clientRepos.filter(function(repo){
      return repo.checked === true;
    });
    var uncheckedClientRepos = clientRepos.filter(function(repo){
      return repo.checked === false;
    });
    var serverRepoIds = serverRepos.map(function(doc){
      return doc.repo_id;
    });
    var checkedClientRepoIds = checkedClientRepos.map(function(doc){
      return doc.repoid;
    });
    var uncheckedClientRepoIds = uncheckedClientRepos.map(function(doc){
      return doc.repoid;
    });

    var newRepoIds = db.compareArrays(checkedClientRepoIds, serverRepoIds).leftUniq;
    var removedRepoIds = db.compareArrays(uncheckedClientRepoIds, serverRepoIds).intersect;

    console.log('DEBUG++++++++++++++++++++');
    console.log('serverRepoIds:',serverRepoIds);
    console.log('checkedClientRepoIds:',checkedClientRepoIds);
    console.log('uncheckedClientRepoIds:',uncheckedClientRepoIds);
    console.log('newRepoIds:',newRepoIds);
    console.log('removedRepoIds:',removedRepoIds);
    console.log('serverRepos:',serverRepos);
    console.log('clientRepos:',clientRepos);
    console.log('checkedClientRepos:',checkedClientRepos);
    console.log('uncheckedClientRepos:',uncheckedClientRepos);
    console.log('req.body:',req.body);
    console.log('DEBUG--------------------');


    checkedClientRepos.forEach(function(repo){
      if (newRepoIds.indexOf(repo.repoid) !== -1) {
        console.log('Inserting repo/user');
        db.getOrInsertRepo(repo); // ignoring callback
      }
    });

    uncheckedClientRepos.forEach(function(repo){
      if (removedRepoIds.indexOf(repo.repoid) !== -1) {
        console.log('Removing repo/user');
        db.removeUserFromRepo(repo.userid, repo.repoid, repo.html_url);
      }
    });
  }); 
  
  res.status(201).send('data received. thank you');
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

app.get('/results/:userid', function(req, res){
  //console.log('This is the request:', req);
  db.findAllReposByUser(req.param.userid, function(docs) {
    var collection = docs.map(function(doc){
      delete doc.users;
      return doc;
    });
    res.status(201).send(collection);
  }); 
});
