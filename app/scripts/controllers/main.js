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
    vm.results = {};
    vm.selectDeparture = vm.departureStop[0];
    vm.selectArrival = vm.arrivalStop[0];
    var ct = transit;
    ct.open();
    var weekday = false;
    var saturday = false;
    var sunday = false;
    getDayOfWeek();

    function getDayOfWeek() {
      var date = new Date();
      var day = date.getDay();
      if (day < 6) {
        weekday = true;
      } else {
        if (day == 6) {
          saturday = true;
        } else {
          sunday = true;
        }
      }
    }
    vm.findbtn = function (a, d) {
      vm.selectDeparture = d;
      vm.selectArrival = a;
      console.log(d, a);
      if (d === a) {
        vm.results = [];
        vm.err = true;
        vm.error = 'The Departure and Arrival Stations must be different';
        return;
      } else {
        // var results = ct.searchDepartureTimes(d)
        var departureResults = ct.searchDepartureTimes(d)
        var arrivalResults = ct.searchArrivalTimes(a)
        setTimeout(function () {
          if (departureResults.length > 0 && arrivalResults.length > 0) {
            findMatchingTripIds(departureResults, arrivalResults)
          }
        }, 1000)
        vm.selected = true;
        vm.err = false;
        if (!departureResults) {
          console.log(err.stack)
          return err;
        }
      };
    }

    function findMatchingTripIds(departure, arrival) {
      var dep_time = [];
      var arr_time = [];
      departure.forEach(function (dep) {
        arrival.forEach(function (arr) {
          if ((dep.trip_id) == (arr.trip_id)) {
            if (weekday == true) {
              if (dep.trip_id.indexOf('a') == -1 && dep.trip_id.indexOf('u') == -1) {
                dep_time.push(dep)
              }
            } else {
              if (saturday == true) {
                if (dep.trip_id.indexOf('a') !== -1) {
                  dep_time.push(dep)
                }
              } else {
                dep_time.push(dep)
              }
            }
          }
          if ((arr.trip_id) == (dep.trip_id)) {
            if (weekday == true) {
              if (arr.trip_id.indexOf('a') == -1 && arr.trip_id.indexOf('u') == -1) {
                arr_time.push(arr)
              }
            } else {
              if (saturday == true) {
                if (arr.trip_id.indexOf('a') !== -1) {
                  arr_time.push(arr)
                }
              } else {
                arr_time.push(arr)
              }
            }
          }
        })
      })
      vm.results.departure = dep_time
      vm.results.arrival = arr_time
      $scope.$apply('results', function (newVal, oldVal) {
        vm.results = newVal;
      });
      console.log(vm.results)
    }


    // Get Station Names 
    ct.stops
      .orderBy('stop_name')
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






  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController);
  MainController.$inject = ['$scope', 'transitFactory'];
})(this);
