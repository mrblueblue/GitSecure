'use strict';

var request = require('request');

// expects a git hub URL similar to 
// https://github.com/:user/:repo with no trailing slash
// authToken must have webHook write access to the repo
// unsubscribe: Bool Defaults to false
exports.registerRepo = function(repoUrl, authToken, unsubscribe) {
  var targetUrl = repoUrl + '/events/push.json';
  var subscribe = unsubscribe ? 'unsubscribe' : 'subscribe';
  request.put({
    url: 'https://api.github.com/hub',
    qs: {
      'hub.mode': subscribe,
      'hub.topic': targetUrl,
      'hub.callback': 'http://gitsecure.cloudapp.net:8080',
    },
    auth: {
      username: '',
      password: authToken
    }
  });
};
