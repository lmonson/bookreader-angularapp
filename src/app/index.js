'use strict';

angular.module('bookreader', ['ngResource', 'ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
      //.when('/', {
      //  templateUrl: 'app/main/main.html',
      //  controller: 'MainCtrl'
      //});
      //.otherwise({
      //  redirectTo: '/'
      //});


  })
;
