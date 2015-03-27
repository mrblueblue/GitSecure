
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

  // Get Repo Results Function

  /*
    retire.js ->

      returns: 
    [{"results":[{"component":"qs","version":"0.5.6","parent":{"component":"tiny-lr-fork","version":"0.0.5","parent":{"component":"grunt-contrib-watch","version":"0.6.1","parent":{"component":"GitSecure","version":"0.0.1"},"level":1},"level":2},"level":3,"vulnerabilities":["https://nodesecurity.io/advisories/qs_dos_extended_event_loop_blocking"]}]}]


    scan.js ->
      node scanner.js -t [DIR] -o [OUTPUT FILE NAME]

      example output from scan.js

      { '../2015-02-twittler/data_generator.js': 
       [ { type: 'finding',
           rule: [Object],
           filename: '../2015-02-twittler/data_generator.js',
           line: 55,
           col: undefined },
         filename: '../2015-02-twittler/data_generator.js' ],
      '../2015-02-twittler/jquery.js': 
       [ { type: 'finding',
           rule: [Object],
           filename: '../2015-02-twittler/jquery.js',
           line: 358,
           col: undefined },


    api_key parsing output
    [{\"index\":8420,\"match\":\" = containerVisibil\",\"gitId\":\"55135\",\"key_type\":\"flikrSecret\"}]
*/

  $scope.getResults = function(){
    mainly.getResults(function(data){
      $scope.results = data;
    });
  };

  // Checkmarks a repo given a list of repos user has subscribed to
  
  var checkRepos = function(collection){
    var checkboxes = $('input:checkbox');
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
  var getRepos = function(callback){
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

  var getResults = function(callback){
    $http.get('/results')
      .success(function(data){
        console.log('here are the results: ', data);
        callback(data);
      })
      .error(function(data){
        console.log('error getting ther results: ', data);
      })
  };

  return {
    getRepos: getRepos,
    getResults: getResults
  };

});

