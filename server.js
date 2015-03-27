'use strict';

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

app.get('/getRepos', function(req, res){

  // response as an array of repo ids that
  // the user has subscribed to

  var collection = [
    '28679810', 
    '32131374',
    '31937760'
    ];

  res.status(201).send(collection)

  // console.log("This is the response: ", res)
});

// POST route for sending to DB all repos user wants to subscribe

app.post('/submitRepos', function(req, res){

  // req.body is an object (document)
  // it can also be made into an object {data: repos}
  // where repos is an array of objects (documents)

  console.log("This is the request: ", req.body)

  res.send({hello:'hello'})

  // console.log("This is the response: ", res)
});