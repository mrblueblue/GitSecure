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

// GET route for getting all results from checks

app.get('/results', function(req, res){
  
  res.status(201).send('data');

});

// GET route for getting all subscribed repos

app.get('/repos', function(req, res){

  // response as an array of repo ids that
  // the user has subscribed to

  // Mock Data
  var collection = [
    '28679810', 
    '32131374',
    '31937760'
    ];

  res.status(201).send(collection)
  console.log("This is the response: ", res)
});

// POST route for sending to DB all repos user wants to subscribe

app.post('/repos', function(req, res){

  // req.body is an array of repos
  // where repos is an array of repos (document objects)

  console.log("This is the request: ", req.body)

  res.status(201).send('data received. thank you')

  // console.log("This is the response: ", res)
});