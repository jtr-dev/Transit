'use strict';
(function (global) {
  /*
    Methods for Controller
  */
  function MainController($scope, transit) {
    var vm = $scope;

    vm.hello = 'Hello World';
    vm.departureStop = [];
    vm.arrivalStop = [];
    vm.results = [];
    vm.selectDeparture = vm.departureStop[0];
    vm.selectArrival = vm.arrivalStop[0];
    var ct = transit;


    ct.open();
    


    // Get Station Names 
    ct.stops
      .where("stop_name").between(0, "Z")
      .toArray()
      .then(res => {
        let names = [];
        let uniqueNames = [];
        res.map(r => {
          names.push(r.stop_name);
          $.each(names, function (i, el) {
            if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
          });
        });
        vm.arrivalStop = uniqueNames;
        vm.departureStop = uniqueNames;
      });

    vm.findStn = function (d, a) {      
      if (d && a){
        vm.selectDeparture = d;
        vm.selectArrival = a;
        vm.err = false;
        console.log(d, a)
        ct.searchTimes(d, a)
      }
      if(d === a){
        vm.err = true;
        vm.error = 'The Departure and Arrival Stations must be different';
        return;
      }
    };

    function find(key, array) {
      // The variable results needs var in this case (without 'var' a global variable is created)
      var results = [];
      for (var i = 0; i < array.length; i++) {
        if (array[i].indexOf(key) == 0) {
          results.push(array[i]);
        }
      }
      return results;
    }

    vm.stop_times = ct.getAllStopTimes();
    console.table(vm.stop_times)
    
    vm.pointA = ct.getPointAResults('22nd St Caltrain');
    vm.pointB = ct.getPointBResults('Bayshore Caltrain');
    // console.table(vm.pointA)
    // console.table(vm.pointB)
    // ct.searchTimes("22nd St Caltrain", "Bayshore Caltrain")
    


  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController);
  MainController.$inject = ['$scope', 'transitFactory'];
})(this);
