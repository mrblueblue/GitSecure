
'use strict';

angular.module('main',[])
.controller('mainController', function($scope, mainly, $http){

  var collection = [
    '28679810', 
    '32131374',
    '31937760'
    ];

  // Checkmarks a repo given a list of repos user has subscribed to
  var checkRepo = function(collection){
    var checkboxes = $('input:checkbox')
    checkboxes.each(function(index, repo){
      repo = $(repo)
      var repo_id = $(repo).attr('data-repo-id');
      console.log(repo, repo_id)
      if ( collection.indexOf(repo_id) !== -1 ){
        repo.prop('checked', true);
      }
    });
  }

  $scope.populateRepos = function(){
    console.log('populate called!');
    mainly.getRepos(function(data) {
      $scope.repos = data;
    });
  };

  $scope.submit = function(e){
    $http.get('/getRepos').success(function(data){
        console.log(data);
      })
    var checked = $(':checked');
    checked.each(function(index, repo){
      var data = {}
      data.html_url = repo.getAttribute('data-url');
      data.git_url = repo.getAttribute('data-git-url');
      data.user_id = repo.getAttribute('data-user-id');
      data.repo_id = repo.getAttribute('data-repo-id');
      data.repo_name = repo.getAttribute('data-repo-name');
      
      // $http.post('/submitRepos', data).success(function(data){
      //   console.log("this is the response: ", data);
      // })

      $http.get('/getRepos').success(function(data){
        console.log(data);
      })
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

// Get all Repos users has subscribed

// Add repo

// Remove repo

// Get reports for repos


// repo url
// git url
// repo id


var exdata = {
  html_url: "https://github.com/mrblueblue/exercism", 
  git_url: "git://github.com/mrblueblue/exercism.git", 
  user_id: "9220038", 
  repo_id: "28679810"
}

