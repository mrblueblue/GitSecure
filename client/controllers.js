'use strict';

window.angular.module('main',[])
.controller('mainController', function($scope, mainly){
	$scope.email = 'happy';
  //scope variable holding repos

  $scope.populateRepos = function() {
    console.log('populate called!');
    mainly.getRepos(function(data) {
      $scope.repos = data;
    });
  };

})
.factory('mainly', function($rootScope, $http){
  // function that gets repos for curr user
  var getRepos = function(callback) {
    console.log('getRepos called.');
    console.log('rootscope: ', $rootScope);
    var url = 'https://api.github.com/users/' + $rootScope.username + '/repos';
    console.log('url used: ', url);
    $http.get(url)
      .success(function(data) { // unused status, headers, config
        console.log('get request succeded!: ', data);
        callback(data);
        
      })
      .error(function(data) { //unused status, headers, config
        console.log('error getting github repos!: ', data);
      });
  };

  return {getRepos: getRepos};
});
