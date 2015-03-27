
'use strict';

angular.module('main',[])
.controller('mainController', function($scope, mainly, $http){

  $scope.populateRepos = function() {
    console.log('populate called!');
    mainly.getRepos(function(data) {
      $scope.repos = data;
    });
  };

  $scope.submit = function(e){
    var checked = $(':checked');

    checked.each(function(index, repo){
      var url = repo.getAttribute('id');
      $http.post('some-url', url);
    })
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
