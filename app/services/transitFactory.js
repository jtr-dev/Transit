(function () {
  'use strict';

  angular
    .module('app')
    .factory('transitFactory', transitFactory);
  function transitFactory() {

    var transit = new Dexie('gtfs');


    var gtfs = [
      'calendar',
      'calendar_dates',
      'stop_times',
      'stops',
      'trips'
    ];


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
          return Dexie.Promise.all(gtfs.map(name => new Dexie.Promise((resolve, reject) => {
            $.ajax('gtfs/' + name + '.txt', {
              dataType: 'text'
            }).then(resolve, reject);
          }).then(data => {
            console.log("Got ajax response for " + name);
            return parseCSV(data);
          }).then(res => {
            console.log("Bulk putting " + res.length + " " + name + " records into database");
            return db[name].bulkPut(res);
          }).then(() => {
            console.log("Done importing " + name);
          }))).then(() => {
            console.log("All files successfully imported");
          }).catch(err => {
            console.error("Error importing data: " + (err.stack || err));
            throw err;
          });
        }
      });
    });


    db.searchTimes = function (departure, arrival) {
      let arr = [];
      var results = [];
      db.stops.where("stop_name").startsWithAnyOfIgnoreCase(departure, arrival).toArray().then(res => {
        res.map(r => {
          db.stop_times.where("stop_id").startsWithAnyOf(r.stop_id).toArray().then(res => {
            res.map(r => {
              arr.push(r.trip_id)
            })
              var sorted_arr = arr.slice().sort(); // You can define the comparing function here. 
              // JS by default uses a crappy string compare.
              // (we use slice to clone the array so the
              // original array won't be modified)
              for (var i = 0; i < arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                  results.push(sorted_arr[i]);
                }
              }
          })
        })
        console.table(arr)
        console.log(results);




        // var sorted_arr = arr.slice().sort(); 
        // var results = [];
        // for (var i = 0; i < arr.length - 1; i++) {
        //   if (sorted_arr[i + 1] == sorted_arr[i]) {
        //     results.push(sorted_arr[i]);
        //   }
        // }

        // console.table(results);
      })
    }


    // db.searchTimes = function (departure, arrival) {
    //   let stopTimeIds = [];
    //   let sharedStopId = [];
    //   let sharedNameInStopId = [];
    //   let tripsWithsharedStopId = [];
    //   db.stops.where("stop_name").startsWithAnyOfIgnoreCase(departure, arrival).toArray().then(res => {
    //     res.map(r => {
    //       stopTimeIds.push(r.stop_id);
    //     })
    //       db.stop_times.where("stop_id").startsWithAnyOf(stopTimeIds).toArray().then(res => {
    //         res.map(r => {
    //           sharedStopId.push(r.stop_id)
    //         })
    //         db.stops.where("stop_id").startsWithAnyOf(sharedStopId).toArray().then(res => {
    //           res.map(r => {
    //             sharedNameInStopId.push(r.stop_id);
    //           })
    //           db.stop_times.where("stop_id").startsWithAnyOf(sharedNameInStopId).toArray().then(res =>{
    //             res.map(r =>{
    //               tripsWithsharedStopId.push(r)
    //             })
    //           })
    //         })
    //       })
    //       console.table(tripsWithsharedStopId)

    //   });



    // db.searchTimes = function (departure, arrival) {
    //   let stopTimeIds = [];
    //   let sharedStopId = [];
    //   let sharedNameInStopId = [];
    //   let sharedTripId = [];
    //   db.stops.where("stop_name").startsWithAnyOfIgnoreCase(departure, arrival).toArray().then(res => {
    //       console.log(res)

    //     res.map(r => {
    //       stopTimeIds.push(r.stop_id);
    //     })
    //     // db.stop_times.where("stop_id").startsWithAnyOf(stopTimeIds).toArray().then(res => {
    //     db.stops.where("stop_id").startsWithAnyOf(stopTimeIds).toArray().then(res => {
    //       res.map(r => {
    //         sharedStopId.push(r.stop_id)
    //       })
    //       // console.log(sharedStopId)
    //       db.stop_times.where("stop_id").startsWithAnyOf(sharedStopId).toArray().then(res => {
    //         res.map(r => {
    //           // console.log(r)
    //         })
    //       })
    //     })
    //   });
    // db.stops.where("stop_name").startsWithAnyOfIgnoreCase(departure, arrival).toArray().then(res => {
    //   res.map(r => {
    //     stopTimeIds.push(r.stop_id);
    //   })
    //   console.log(stopTimeIds)
    //   db.stop_times.where("stop_id").startsWithAnyOf(stopTimeIds).toArray().then(res => {
    //     console.log(res);
    //   })
    // })


    return transit;

  }
})();

