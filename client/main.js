'use strict';

window.angular.module('GitSecure', [
  'main',
  'ui.router',
  'ngRoute',
  'ngMaterial'
])

// Begin App Configuration

.config(function($stateProvider, $httpProvider){
  
  // Register HTTP intercepter as an 'anonymous factory.'
  // HTTP interceptors intercept all requests for
  // authentication purposes

  $httpProvider.interceptors.push(function($q, $location) {
    return {
      response: function(response) {
        return response;
      },
      responseError: function(response) {
        if (response.status === 401) {
          $location.url('/login');
        }
        return $q.reject(response);
      }
    };
  });

  // Authorize is an utility function that checks if the user
  // has been authenticated. The function gets called on the
  // 'main' state's resolution (on 'resolve')

  var authorize = function($q, $timeout, $http, $location) { // unused $rootScope
    var deferred = $q.defer();

    $http.get('/loggedin').success(function(user){
      if (user !== 'unauthorized') {
        deferred.resolve();
      } else { 
        deferred.reject(); 
        $location.url('/login');
      } 
    });
    return deferred.promise;
  };

  // Setup up App states. "main" requires login and goes
  // through an authorization check each time

  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'login.html',
      controller: 'mainController'
    })  
    .state('main', {
      url: '/main',
      templateUrl: 'main.html',
      controller: 'mainController',
      data: {requireLogin: true},
      resolve: {check: authorize}
    });

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







})

// Begin the'run block,' where code gets executed after the 
// injector is created and is used to kickstart the application

.run(function ($rootScope, $state, $injector, $http) {

  // If authorized, then redirect to main state

  if (!$rootScope.isAuth){
    $state.go('main');
  }

  // Get Auth Data from server, if authorized then go 
  // to main state; otherwise, redirect to login

  $http.get('/loggedin')
    .success(function(data) { // unused status, headers, config
      if (data === 'unauthorized'){
        $state.go('login');
      } else {
        $rootScope.username = data.username;
        $rootScope.userid = data.id;
        $rootScope.isAuth = true;
        $state.go('main');
      }
    }).
    error(function() { // unused data, status, headers, config
    });

  // State Change Listener
  // if user goes to a route that requires login and
  // is not authorized, then redirect to login

  $rootScope.$on('$stateChangeStart', function (event, toState) { // unused toParams
    var requireLogin = toState.hasOwnProperty('data') ? toState.datarequireLogin : null;
    if (requireLogin && !$rootScope.isAuth) {
      event.preventDefault();
      $state.go('login');
    }
  });
});
