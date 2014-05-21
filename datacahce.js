var db = require('./dbdriver');

var eventData = {};

var loadEventData = function(gid, callback) {
  db.getEvent(gid, function(err, events) {
    if (err) {
      callback(err, null);
    } else {
      eventData[gid] = events;
      callback(null, events);
    }
  });
};


