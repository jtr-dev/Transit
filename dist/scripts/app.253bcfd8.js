'use strict';

/**
 * @ngdoc overview
 * @name app
 * @description
 * # transit app
 *
 * Main module of the application.
 */

angular.module('app', ['ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch']).config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainController',
    controllerAs: 'vm'
  }).otherwise({
    redirectTo: '/'
  });
});

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
        var departureResults = ct.searchDepartureTimes(d);
        var arrivalResults = ct.searchArrivalTimes(a);
        setTimeout(function () {
          if (departureResults.length > 0 && arrivalResults.length > 0) {
            findMatchingTripIds(departureResults, arrivalResults);
          }
        }, 1000);
        vm.selected = true;
        vm.err = false;
        if (!departureResults) {
          console.log(err.stack);
          return err;
        }
      };
    };

    function findMatchingTripIds(departure, arrival) {
      var dep_time = [];
      var arr_time = [];
      departure.forEach(function (dep) {
        arrival.forEach(function (arr) {
          if (dep.trip_id == arr.trip_id) {
            if (weekday == true) {
              if (dep.trip_id.indexOf('a') == -1 && dep.trip_id.indexOf('u') == -1) {
                dep_time.push(dep);
              }
            } else {
              if (saturday == true) {
                if (dep.trip_id.indexOf('a') !== -1) {
                  dep_time.push(dep);
                }
              } else {
                dep_time.push(dep);
              }
            }
          }
          if (arr.trip_id == dep.trip_id) {
            if (weekday == true) {
              if (arr.trip_id.indexOf('a') == -1 && arr.trip_id.indexOf('u') == -1) {
                arr_time.push(arr);
              }
            } else {
              if (saturday == true) {
                if (arr.trip_id.indexOf('a') !== -1) {
                  arr_time.push(arr);
                }
              } else {
                arr_time.push(arr);
              }
            }
          }
        });
      });
      vm.results.departure = dep_time;
      vm.results.arrival = arr_time;
      $scope.$apply('results', function (newVal, oldVal) {
        vm.results = newVal;
      });
      console.log(vm.results);
    }

    // Get Station Names 
    ct.stops.orderBy('stop_name').toArray().then(function (res) {
      var names = [];
      var uniqueNames = [];
      res.map(function (r) {
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
  angular.module('app').controller('MainController', MainController);
  MainController.$inject = ['$scope', 'transitFactory'];
})(undefined);

(function () {
  'use strict';

  angular.module('app').factory('transitFactory', transitFactory);
  function transitFactory() {

    var transit = new Dexie('gtfs');

    var gtfs = ['calendar', 'calendar_dates', 'stop_times', 'stops', 'trips'];

    function parseCSV(csv) {
      var lines = csv.split("\n");
      var result = [];
      var headers = lines[0].split(",");
      for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }
      return result; // No need to make it JSON
    }

    var db = transit;

    db.version(1).stores({
      'calendar': "++id,service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date",
      'calendar_dates': "++id,service_id,date,exception_type",
      'stop_times': "++id,trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type",
      'stops': "++id,stop_id,stop_code,stop_name,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,platform_code,wheelchair_boarding",
      'trips': "++id,route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,shape_id,wheelchair_accessible,bikes_allowed"
    });

    // Populate from AJAX:
    db.on('ready', function () {
      return db.calendar.count(function (count) {
        if (count > 0) {
          console.log("Already populated, 'gtfs' is already created at this domain.");
        } else {
          console.log("Database is empty. Populating from ajax call...");
          return Dexie.Promise.all(gtfs.map(function (name) {
            return new Dexie.Promise(function (resolve, reject) {
              $.ajax('gtfs/' + name + '.txt', {
                dataType: 'text'
              }).then(resolve, reject);
            }).then(function (data) {
              console.log("Got ajax response for " + name);
              return parseCSV(data);
            }).then(function (res) {
              console.log("Bulk putting " + res.length + " " + name + " records into database");
              return db[name].bulkPut(res);
            }).then(function () {
              console.log("Done importing " + name);
            });
          })).then(function () {
            console.log("All files successfully imported");
          }).catch(function (err) {
            console.error("Error importing data: " + (err.stack || err));
            throw err;
          });
        }
      });
    });

    db.getAllStopTimes = function () {
      var arr = [];
      db.stop_times.orderBy('id').toArray().then(function (res) {
        return arr.push(res);
      }).then(function () {
        console.log(arr);
      }).catch(function (err) {
        console.log("Exception thrown: " + (err.stack || err));
        throw err;
      });
      return arr;
    };

    db.searchDepartureTimes = function (departure) {
      var departureTimes = [];
      db.stops.where("stop_name").startsWithAnyOfIgnoreCase(departure).toArray().then(function (res) {
        res.forEach(function (r) {
          db.stop_times.where("stop_id").startsWithAnyOf(r.stop_id).toArray().then(function (res) {
            res.map(function (r) {
              departureTimes.push(r);
            });
          });
        });
      }).then(function () {
        console.log(departureTimes);
      }).catch(function (err) {
        console.log(err.stack);
        return err;
      });
      return departureTimes;
    };

    db.searchArrivalTimes = function (arrival) {
      var arrivalTimes = [];
      db.stops.where("stop_name").startsWithAnyOfIgnoreCase(arrival).toArray().then(function (res) {
        res.forEach(function (r) {
          db.stop_times.where("stop_id").startsWithAnyOf(r.stop_id).toArray().then(function (res) {
            res.map(function (r) {
              arrivalTimes.push(r);
            });
          });
        });
      }).then(function () {
        // console.log(arrivalTimes.length);
      }).catch(function (err) {
        console.log(err.stack);
        return err;
      });
      return arrivalTimes;
    };

    return transit;
  }
})();

//# sourceMappingURL=app.253bcfd8.js.map
//# sourceMappingURL=app.js.map
