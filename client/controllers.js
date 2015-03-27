
'use strict';

angular.module('main',['ngMaterial'])
.controller('mainController', function($scope, mainly, $http){


  // Tab Functionality for Material Design

  $scope.next = function() {
    $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
  };

  $scope.previous = function() {
    $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
  };

  // Checkmarks a repo given a list of repos user has subscribed to
  
  var checkRepos = function(collection){
    var checkboxes = $('input:checkbox')
    checkboxes.each(function(index, repo){
      repo = $(repo)
      var repo_id = $(repo).attr('data-repo-id');
      if ( collection.indexOf(repo_id) !== -1 ){
        repo.prop('checked', true);
      }
    });
  }

  $scope.populateRepos = function(){
    console.log('populate called!');
    mainly.getRepos(function(data) {
      $scope.repos = data;
      $http.get('/repos').success(function(data){
        checkRepos(data);
      })
    });
  };

  $scope.submit = function(e){
    var checked = $(':checked');
    var repos = [];
    checked.each(function(index, repo){
      var data = {};
      repo = $(repo)
      data.html_url = repo.attr('data-url');
      data.git_url = repo.attr('data-git-url');
      data.user_id = repo.attr('data-user-id');
      data.repo_id = repo.attr('data-repo-id');
      data.repo_name = repo.attr('data-repo-name');
      repos.push(data);
      // Example data object
      // var exdata = {
      //   html_url: "https://github.com/mrblueblue/exercism", 
      //   git_url: "git://github.com/mrblueblue/exercism.git", 
      //   user_id: "9220038", 
      //   repo_id: "28679810"
      // }
    });

    $http.post('/repos', repos).success(function(data){
      console.log("response received: ", data);
    });    
  };

})
.factory('mainly', function($rootScope, $http){
  // function that gets repos for curr user
  var getRepos = function(callback) {
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

