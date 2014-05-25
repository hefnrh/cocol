var db = require('./dbdriver');

var eventData = {};

var map = function(eveInDB) {
  var ret = eveInDB.event;
  ret.eventID = eveInDB.eid;
  return ret;
}

var loadEventData = function(gid, callback) {
  db.getEvents(gid, function(err, events) {
    if (err) {
      callback(err);
    } else {
      eventData[gid] = events.map(map);
      callback(null);
    }
  });
};

var saveEvent = function(gid, eve, callback) {
  if (!eventData[gid]) {
    loadEventData(gid, function(err) {
      if (err) {
	callback(err);
      } else {
	db.insertEvent(gid, eve, function(err) {
	  if (err) {
	    callback(err);
	  } else {
	    eve.eventID = eventData[gid].length;
	    eventData[gid][eventData[gid].length] = eve;
	    callback(null);
	  }
	});
      }
    });
  } else {
    db.insertEvent(gid, eve, function(err) {
      if (err) {
        callback(err);
      } else {
	eve.eventID = eventData[gid].length;
        eventData[gid][eventData[gid].length] = eve;
	callback(null);
      }
    });
  }
};

// TODO filter private message
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
