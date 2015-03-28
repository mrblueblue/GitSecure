'use strict';
var childProcess = require('child_process');

// function to scan a directory using retirejs
var retireScan = function(dir) {
  console.log('RICH CHECK retireScan finished... dir to scan: ', dir);
  var results = childProcess.spawnSync('retire', [ '--jspath', dir, '--outputformat', 'json'], {encoding: 'utf8'});

  // returning the 2nd value in the output object
  // according to the docs this should be stderr (error value), but it's actually where our values are :D
  return results ? results.output[2]: null;
};


// exporting the scanning function so it can be used w/ require
exports.retireScan = retireScan;