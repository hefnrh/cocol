var db = require('./dbdriver');

var eventData = {};

var loadEventData = function(gid, callback) {
  db.getEvent(gid, function(err, events) {
    if (err) {
      callback(err);
    } else {
      eventData[gid] = events;
      callback(null);
    }
  });
};

var saveEvent = function(gid, eve, callback) {
  db.insertEvent(gid, eve, function(err) {
    if (err) {
      callback(err);
    } else {
      eventData[gid][eventData[gid].length] = {_id:eventData[gid].length, gid: gid, event: eve};
      callback(null);
    }
  });
};

var getEvents = function(gid, fromId, callback) {
  if (!eventData[gid]) {
    loadEventData(gid, function(err) {
      if (err) {
	callback(err, null);
      } else {
	callback(null, eventData[gid].slice(fromId));
      }
    });
  } else {
    callback(null, eventData[gid].slice(fromId));
  }
};

exports.saveEvent = saveEvent;
exports.getEvents = getEvents;
exports.removeCache = function(gid) {
  delete eventData[gid];
};
