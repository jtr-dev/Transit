'use strict';
(function(global) {
  /*
    Methods for Controller
  */
  function MainController ($scope, transit) {
    var vm = $scope;

    vm.hello = 'Hello World';
    vm.departureStop = [];
    vm.arrivalStop = [];
    vm.results = [];
    vm.selectDeparture = vm.departureStop[0];
    vm.selectArrival = vm.arrivalStop[0];

    // console.log(transit.friends);
    // console.log( transit ) 
    transit.open();



  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController);
  MainController.$inject = ['$scope', 'transitFactory'];
})(this);
