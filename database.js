'use strict';

var uri = process.env.DBURI || '127.0.0.1:27017/development';
exports.db = require('monk')(uri);

// Assume immutable types are stored in the arrays
exports.compareArrays = function (leftArray, rightArray) {
  var intersect = [];

  leftUniq = leftArray.filter(function(item){
    if (rightArray.indexOf(item) !== -1) {
      intersect.push(item);
      return false;
    } else {
      return true;
    }
  });

  rightUniq = rightArray.filter(function(item){
    return leftArray.indexOf(item) === -1;
  });

  return {
    rightUniq: rightUniq,
    leftUniq: leftUniq,
    intersect: intersect
  };
};
