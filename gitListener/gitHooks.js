'use strict';

var curl = require('curlrequest');

// expects a git hub URL similar to 
// https://github.com/:user/:repo with no trailing slash
// authToken must have webHook write access to the repo
// unsubscribe: Bool Defaults to false
exports.registerRepo = function(repoUrl, authToken, unsubscribe) {
  var targetUrl = repoUrl + '/events/push.json';
  var subscribe = unsubscribe ? 'unsubscribe' : 'subscribe';
  console.log('registering repo');
  curl.request({
    url: 'https://api.github.com/hub',
    method: 'POST',
    headers: {
      'User-Agent': 'graffiome/GitSecure',
      'Authorization': 'token ' + authToken
    },
    data: {
      'hub.mode': subscribe,
      'hub.topic': targetUrl,
      'hub.callback': 'http://gitsecure.cloudapp.net:8080',
    }
  }, function(error, incoming, body){
    console.log('registration response');
    if (error) {
      console.log('error:', error);
    }
    if (incoming) {
      console.log('response', incoming);
    }
    if (body) {
      console.log('response', body);
    }
  });
  console.log('registration sent');
};
