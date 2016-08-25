'use strict';

/**
 * @ngdoc overview
 * @name app
 * @description
 * # transit app
 *
 * Main module of the application.
 */
angular
  .module('app', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
