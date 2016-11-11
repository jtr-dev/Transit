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
       setTimeout(function () {
      vm.results.duration = duration(dep_time, arr_time)
      vm.results.departure = dep_time
      vm.results.arrival = arr_time
      $scope.$apply('results', (newVal, oldVal) => {
        vm.results = newVal;
      });
       }, 1000)
      console.log(vm.results)
    }


    function duration(departure, arrival) {
      var result = [];


      departure.forEach((value, index) => {
        
        var t1 = new Date();
        var parts = value.departure_time.split(":");
        t1.setHours(parts[0], parts[1], parts[2], 0);
        var t2 = new Date();
        parts = arrival[index].arrival_time.split(":");
        t2.setHours(parts[0], parts[1], parts[2], 0);

        var millisec = parseInt(Math.abs(t1.getTime() - t2.getTime()));

        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
          result.push(seconds + " Sec");
        } else if (minutes < 60) {
          result.push(minutes + " Min");
        } else if (hours < 24) {
          result.push(hours + " Hrs");
        } else {
          result.push(days + " Days");
        }
      })
      return result;
    }


    // console.log(vm.duration('6:29:00', '6:35:00'))





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
