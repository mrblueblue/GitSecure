'use strict';

window.angular.module('main',['ngMaterial'])
.controller('mainController', function($scope, mainly, $http){

  // Tab Functionality for Material Design

  $scope.next = function() {
    $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
  };

  $scope.previous = function() {
    $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
  };

  $scope.getResults = function(){
    mainly.getResults(function(data){
      $scope.results = data;
    });
  };

  // Checkmarks a repo given a list of repos user has subscribed to
  
  var checkRepos = function(collection){
    var checkboxes = $('input:checkbox');
    checkboxes.each(function(index, repo){
      repo = $(repo);
      var repoid = $(repo).attr('data-repo-id');
      console.log('this is collection', collection);
      if ( collection.indexOf(repoid) !== -1 ){
        repo.prop('checked', true);
      }
    });
  };

  $scope.populateRepos = function(){
    console.log('populate called!');
    mainly.getRepos(function(data, userid) {
      $scope.repos = data;
      $http.get('/repos/' + userid).success(function(data){
        checkRepos(data);
      });
    });
  };

  $scope.submit = function() { //ignoring event
    var checked = $(':checked');
    var repos = [];
    checked.each(function(index, repo){
      var data = {};
      repo = $(repo);
      data.userid = repo.attr('data-user-id');
      data.repoid = repo.attr('data-repo-id');
      data.name = repo.attr('data-repo-name');
      data.html_url = repo.attr('data-url');
      data.git_url = repo.attr('data-git-url');
      repos.push(data);
      // Example data object

      //  userid: userid,
      //  repoid: repoid,
      //  name: name,
      //  html_url: html_url,
      //  git_url, git_url,
      // }

    });

    $http.post('/repos/', repos).success(function(data){
      console.log('response received:', data);
    });    
  };

})
.factory('mainly', function($rootScope, $http){

  // function that gets repos for curr user
  var getRepos = function(callback){
    var url = 'https://api.github.com/users/' + $rootScope.username + '/repos';
    $http.get(url)
      .success(function(data) { // unused status, headers, config
        console.log('this is the userid', $rootScope.userid.toString());
        callback(data, $rootScope.userid.toString());
      })
      .error(function(data) { //unused status, headers, config
        console.log('error getting github repos!: ', data);
      });
  };

  var getResults = function(callback){

    $http.get('/results/'+$rootScope.userid)
      .success(function(data){
        console.log('here are the results: ', data);
        callback(data);
      })
      .error(function(data){
        console.log('error getting ther results: ', data);
      });
  };

  return {
    getRepos: getRepos,
    getResults: getResults
  };

});

