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
