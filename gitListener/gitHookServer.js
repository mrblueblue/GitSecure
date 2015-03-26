'use strict';

var deploy = require('./deploy.js').deploy;
var processRepo = require('../server/services/processRepo.js').processRepo;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var server = app.listen(8080, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('example app listening at http://%s:%s', host, port);
});

app.use(bodyParser.json());

app.post('/', function(req, res){
  console.log(req.body);
  // If this is our repo deploy
  if (req.body.repository && req.body.repository.full_name === 'graffiome/GitSecure') {
    deploy();
  } else if (req.body.repository && req.body.repository.id) { //other repo, scan
    processRepo(req.body.repository.id);
  }
  res.end();
});


