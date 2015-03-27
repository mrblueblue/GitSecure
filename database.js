'use strict';

var uri = process.env.DBURI || '127.0.0.1:27017/development';
var db = exports.db = require('monk')(uri);

// Assume immutable types are stored in the arrays
exports.compareArrays = function (leftArray, rightArray) {
  var intersect = [];

  var leftUniq = leftArray.filter(function(item){
    if (rightArray.indexOf(item) !== -1) {
      intersect.push(item);
      return false;
    } else {
      return true;
    }
  });

  var rightUniq = rightArray.filter(function(item){
    return leftArray.indexOf(item) === -1;
  });

  return {
    rightUniq: rightUniq,
    leftUniq: leftUniq,
    intersect: intersect
  };
};

exports.findAllReposByUser = function(userID, callback) {
  db.get('Repos').find({'repo_info.users': userID})
    .on('complete', function(err, docs) {
      if (err) {
        console.log('find all repos by user failed with error!', err);
      } else {
        if (callback) {
          callback(docs);
        }
        console.log('reposbyuser query worked: ', docs);
      }
    });
};

