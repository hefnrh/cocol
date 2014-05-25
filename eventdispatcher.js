var cache = require('./datacache');
var db = require('./dbdriver');

var insertEvent = function(uid, gid, eve, callback) {
  switch (eve.eventType) {
    case 0: // public message
    case 1: // private message
      cache.saveEvent(gid, eve, callback);
      break;
    case 2: // create or modify character
      db.insertCharacter(uid, gid, eve.name, eve.detail, eve.picture, eve.font, function(err) {
	if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 3: // modify custom game data
      db.updateData(gid, eve.data, function(err) {
	if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 4: // change background
      db.setBackground(gid, eve.background, function(err) {
	if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 5: // move avatar
      db.updateAvatar(gid, eve.name, eve.visible, eve.x, eve.y, function(err) {
	if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 6: // move photo
      db.updatePhoto(gid, eve.name, eve.visible, eve.x, function(err) {
        if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 7: // update note
      db.updateNote(gid, eve.content, function(err) {
        if (err) {
	  callback(err);
	} else {
	  cache.saveEvent(gid, eve, callback);
	}
      });
      break;
    case 8: // play bgm
      cache.saveEvent(gid, eve, callback);
      break;
    default: callback(null);
  }
};

exports.insertEvent = insertEvent;
