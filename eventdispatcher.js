var cache = require('./datacache');
var db = require('./dbdriver');

var rand = function(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

var roll = function(time, size, condition, room) {
  var rollEve = {eventType: 0, fromCharacter: 'Cthulhu', room: room, color:'000000', size: 32};
  var content = time + 'd' + size + ' = ';
  try {
    time = eval(time);
    size = eval(size);
    var result = 0;
    if (time === 1) {
      result = rand(0, size) + 1;
      content += result;
    } else {
      content += '[ ';
      for (var i = 0; i < time; ++i) {
	var tmp = rand(0, size) + 1;
	result += tmp;
	content += tmp + ' ';
      }
      content += '] = ' + result;
    }
    if (condition !== null) {
      var success = false;
      try {
	success = eval(result + condition);
	content += ' ' + condition + ' ';
      if (success) {
	  content += 'success';
        } else {
	  content += 'fail';
        }
      } catch (e) {}
    }
    rollEve.content = content;
    return rollEve;
  } catch (err) {
    return null;
  }
}

var matchRoll = function(str, room) {
  var res = str.match(/^[0-9+\-*\/() ]+d[0-9+\-*\/() ]+[<>=0-9+\-*\/() ]+/);
  if (!res) {
    return null;
  }
  res = res[0];
  var condition = res.match(/[<>=]+[0-9+\-*\/() ]+/);
  if (condition) {
    condition = condition[0];
  }
  res = res.split(/[<>=d]+/)
  return roll(res[0], res[1], condition, room);
}

var insertEvent = function(uid, gid, eve, callback) {
  switch (eve.eventType) {
    case 0: // public message
      cache.saveEvent(gid, eve, function(err) {
	if (err) {
	  callback(err);
	} else {
	  var cthulhu = matchRoll(eve.content, eve.room);
	  if (cthulhu !== null) {
	    cache.saveEvent(gid, cthulhu, callback);
	  }
	}
      });
      break;
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
