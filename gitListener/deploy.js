'use strict';

var childProcess = require('child_process');

exports.deploy = function() {
  var execOptions = {
    cwd: '/home/gitsecure/GitSecure/',
  };
  var gitCmd = 'git pull --rebase origin master';
  var npmCmd = 'npm install';
  var bowerCmd = 'bower install';
  childProcess.exec(gitCmd, execOptions, function(err, stdout, stderr){
    if (err) {console.error(err);}
    if (stdout) {console.log(stdout);}
    if (stderr) {console.warn(stderr);}
    childProcess.exec(npmCmd, execOptions, function(err, stdout, stderr){
      if (err) {console.error(err);}
      if (stdout) {console.log(stdout);}
      if (stderr) {console.warn(stderr);}
    });
    childProcess.exec(bowerCmd, execOptions, function(err, stdout, stderr){
      if (err) {console.error(err);}
      if (stdout) {console.log(stdout);}
      if (stderr) {console.warn(stderr);}
    });
  });
};
