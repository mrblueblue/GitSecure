'use strict';

var db = require('../../../database.js');
var spawn = require('child_process').spawn;
var fs = require('fs');
var async = require('async');
var fileSystemUtilities = require('./../fileSystem/utilities');
var emailService = require('./../email/emailer.js');

var APIRegexes = {
  flikrKey: /(flikr)? (key)? ?[:=] ?[a-z0-9]{32}/i, 
  flikrSecret: /(flikr)? (secret)? ?[:=] ?[a-z0-9]{16}/i,
  blockchainKey: /(blockchain)? (key)? ?[:=] ?[a-z0-9-]{36}/i,
  blockchainSecret: /(blockchain)? (secret)? ?[:=] ?[a-z0-9]{56}/i,
  bitpayKey: /(bitpay)? (key)? ?[:=] ?[a-z0-9]{26}/i, 
  coinkite: /(coinkite)? (key)? ?[:=] ?[a-z0-9-]{35}/i,
  amazonKey: /(amazon)? (key)? ?[:=] ?[A-Z1-9]{20}/,
  amazonSecret: /(amazon)? (secret)? ?[:=] ?[a-z0-9\/]{35}/i, 
  // linkedin: /\d{4}\w{8}\d\w/,
  yahooKey: /(yahoo)? (key)? ?[:=] ?[a-z0-9]{100}/i, 
  bingKey: /(bing)? (key)? ?[:=] ?[a-z0-9]{40}/i,
  bingSecret: /(bing)? (secret)? ?[:=] ?[a-z0-9\/]{43}/i,
  facebookKey: /(facebook)? (key)? ?[:=] ?\d{15}/, //not precise
  // facebookSecret: /(facebook)? (secret)? ?[:=] ?[0-9a-z]/,
  twitterKey: /(twitter)? (key)? ?[:=] ?[a-z0-9]{25}/i,
  twitterSecret: /(twitter)? (secret)? ?[:=] ?[a-z0-9]{25}/i,
  spotifyKey: /(spotify)? (key)? ?[:=] ?[a-z0-9]{32}/,
  nytimes: /(nytimes)? (key)? ?[:=] ?[a-z0-9:]{44}/,
  yelpKey: /\w{16}-[a-zA-Z1-9:]{5}/,
  stripe: /(pk|sk)_live_\w{24}/,
  google: /AIza.{35}/,
  ebay: /api1.ebay.com/,
  paypal: /us_api1.paypal.com/,
  azureMongo: /-@\w{2}\d{6}\.mongolab\.com:\d{5}/,
};

var decorateHitData = function(obj, result, pathName, regex) {
  obj.index = result.index;
  obj.match = result[0];
  obj.gitId = pathName.match(/[0-9]+/)[0];
  obj.key_type = regex;
  return obj;
};

var storeHitData = function(data) {
  var hitData = db.get('hitdata');
  hitData.insert(data).on('complete', function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Persisted API Key hit for ' + data.key_type);
      var emailObj = {
        fullname: 'Joshua Newman',
        repo: data.gitId,
        username: 'GitSecure'
      };
      emailService.sendMessage(emailObj);
    }
  });
};

var findAPIKey = function(regex, text) {
  return regex.exec(text);
};

var processFile = function(text, pathName, callback) {
  for( var regex in APIRegexes ) {
    var result = findAPIKey(APIRegexes[regex], text );
      if (result) {
        var APIData = {};
        decorateHitData(APIData, result, pathName, regex);
        storeHitData(APIData);
      }
  }
  callback();
  fileSystemUtilities.removeDirectoryAsync(pathName);
};

var getTextFile = function(path, callback) {
  var content;
  fs.readFile(path, 'utf8',function (err, data) {
      if (err) {
          throw err;
      }
      content = data;
      callback(content);
  });
};

var concatDirectory = function(pathName, callback) {
  var path = __dirname + '/../../../git_data/' + pathName;
  var dirNamePath = __dirname + '/concatDirectories.sh';
  var dirCWD = __dirname + '/../../../git_data/' + pathName +'/';
  var bash = spawn('sh', [ dirNamePath ], {
    cwd: dirCWD,
    env: './'
  });

  bash.on('close', function(){
    getTextFile(path + '/concatenatedDirectory.txt', function(text) {
      processFile(text, path, function() {
        callback();
      });
    });
  });
};

module.exports.parseFile = function(directoryList, callback) {
 async.eachSeries(directoryList, function(directoryName, itemCallback) {
   var path = directoryName;
   concatDirectory(path, function() {
     itemCallback();
   });
 }, function() {
   callback();
 });
};

