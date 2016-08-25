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
    var TD = new transit();

    TD.getDBConnection()
      .then(function(db){
        console.log('Database connected & Schema creation done successfully');

        removeTopMessage();
        displayTopMessage('Loading info...', 'blue');

        setTimeout(function() {
          TD.retrieveStops()
          .then(function(stops) {
            removeTopMessage();
            displayStopsSelection(stops);
          })
          .catch(function(error) {
            vm.error = error;
          });
        }, 200);



      });

      vm.findbtn = function(d, a) {
        resetSearchResults();
        vm.selectDeparture = d;
        vm.selectArrival = a;
        console.log(d,a);
        if (d === a) {
          vm.results = [];
          vm.err = true;
          vm.error = 'The Departure and Arrival Stations must be different';
          return;
        } else {

          TD.searchSchedule(d, a)
            .then(function(results) {
              displayResultList(results, d, a);
              vm.selected = true;
              vm.err = false;
            });
        }
      };





    function displayStopsSelection(stops) {
      return stops.forEach(function(d) {
        vm.departureStop.push(d.stop_name);
        vm.arrivalStop.push(d.stop_name);
      });
    }



    function displayResultList(data, departure_stop, arrival_stop) {
      vm.results = [];
      var departureData = null;
      var arrivalData = null;
      var scheduleObject = {};

      for (var i = 0; data.length > i; i++) {
        if (data[i].stops.stop_name === departure_stop) {
          departureData = data[i].stop_times;
          continue;
        } else {
          arrivalData = data[i].stop_times;
        }

        if (departureData &&
            arrivalData &&
            departureData.trip_id === arrivalData.trip_id &&
            departureData.departure_time < arrivalData.arrival_time) {
            scheduleObject = {
              'departure': departureData.departure_time,
              'arrival': arrivalData.arrival_time,
              'duration': getDuration(departureData.departure_time, arrivalData.arrival_time)
            };
            vm.results.push(scheduleObject);
            console.log(vm.results);
            departureData = null;
            scheduleObject = null;
      }
    }

    $scope.$apply('results', function (newVal, oldVal) {
      vm.results = newVal;
    });
  };


    /**
     * Helper functions
     */

    function getDuration(departure_time, arrival_time) {
      var dSec = hhmmssToSeconds(departure_time);
      var aSec = hhmmssToSeconds(arrival_time);
      var duration = (aSec - dSec) / 60 ;

      return duration.toString() + ' min';
    }

    function sortSchedules(a, b) {
      if (hhmmssToSeconds(a.departure) > hhmmssToSeconds(b.departure)) {
        return 1;
      } else if(hhmmssToSeconds(a.departure) < hhmmssToSeconds(b.departure)) {
        return -1;
      } else {
        return 0;
      }
    }

    function hhmmssToSeconds(time) {
      var t = time.split(':');
      var hour = parseInt(t[0]);
      var minute = parseInt(t[1]);
      var second = parseInt(t[2]);

      return hour*60*60 + minute*60 + second;
    }

    function resetSearchResults() {
      // Reset Search Result
      $('#search-result').empty();
      // Reset Error
      $('#error').empty();
      // Hide no-result
      if ($('#noresult').hasClass('show')) {
        $('#noresult').removeClass('show');
      }
    }

    function displayResultError() {
      // Diplay the error
      $('#error').append('<p class="error-msg">Arrival station must be different</p>');
      // Erase search result
      $('#search-result').empty();
      // Hide Search result table
      if ($('#noresult').hasClass('show')) {
        $('#noresult').removeClass('show');
      }
    }

    function displayTopMessage(message, color) {
      $('#loading-status').append('<p class="loading-status-'+color+'">'+message+'</p>');
    }

    function removeTopMessage(){
      $('#loading-status').empty();
    }



  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController);
  MainController.$inject = ['$scope', 'transitFactory'];
})(this);
