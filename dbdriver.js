var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var db = new Db('coc', new Server('localhost', 27017, {auto_reconnect:true}), {safe: true});

db.open(function(err, db) {
  if (err) {
    console.log('error occurred when connect to mongodb');
  } else {
    console.log('connect mongodb success');
  }
});

var generateId = function(typeName, callback) {
  db.collection('counters', function(err, counters) {
    if (err) {
      callback(err, null);
    } else {
      counters.findAndModify({type: typeName}, {seq: 1}, {$inc: {seq: 1}}, function(err, doc) {
	if (err) {
	  callback(err, null);
	} else {
	  callback(null, doc.seq);
	}
      });
    }
  });
};

var generateEventId = function(gid, callback) {
  db.collection('counters', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.findAndModify({gid: gid}, {seq: 1}, {$inc: {seq: 1}}, function(err, doc) {
	if (err) {
	  callback(err, null);
	} else {
	  callback(null, doc.seq);
	}
      });
    }
  });
};

exports.insertUser = function(un, pw, saltString, callback) {
  db.collection('users', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      generateId('userid', function(err, uid) {
        if (err) {
          callback(err, null);
        } else {
	  col.insert({_id: uid, username: un, password: pw, salt: saltString}, function(err, result) {
	    if (err) {
	      callback(err, null);
	    } else {
	      callback(null, uid);
	    }
	  });
        }
      });
    }
  });
};

exports.isUsernameExisted = function(un, callback) {
  db.collection('users', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.findOne({username: un}, function(err, item) {
	if (err) {
	  callback(err, null);
	} else {
	  callback(null, item != null);
	}
      });
    }
  });
};

exports.getUIDPWSalt = function(un, callback) {
  db.collection('users', function(err, col) {
    if (err) {
      callback(err, null, null, null);
    } else {
      col.findOne({username: un}, function(err, item) {
	if(err) {
	  callback(err, null, null, null);
	} else {
	  if (item == null) {
	    callback(null, null, null, null);
	  } else {
	    callback(null, item._id, item.password, item.salt);
	  }
	}
      });
    };
  });
};

exports.getGIDPWSalt = function(gid, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null, null);
    } else {
      col.findOne({_id:gid}, function(err, item) {
	if (err) {
	  callback(err, null, null);
	} else {
	  if (item == null) {
	    callback(null, null, null);
	  } else {
	    callback(null, item.password, item.salt);
	  }
	}
      });
    }
  });
};

exports.changePW = function(un, npw, nsalt, callback) {
  db.collection('users', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.update({username: un}, {$set: {password: npw, salt: nsalt}}, function(err, result) {
	callback(err);
      });
    }
  });
};

exports.isGameNameExisted = function(name, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.findOne({gameName: name}, function(err, item) {
	if (err) {
	  callback(err, null);
	} else {
	  callback(null, item != null);
	}
      });
    }
  });
};

exports.joinGame = function(uid, gid, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.update({_id: gid}, {$addToSet: {player: uid}}, callback);
    }
  });
};

exports.insertGame = function(uid, name, pw, saltString, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      generateId('gameid', function(err, gid) {
        if (err) {
          callback(err, null);
        } else {
	  col.insert({_id: gid, user: uid, gameName: name, password: pw, salt: saltString, player:[uid]}, function(err, result) {
	    if (err) {
	      callback(err, null);
	    } else {
	      db.collection('counters', function(err, col) {
		if (err) {
		  callback(err, null);
		} else {
		  col.insert({type: 'eventid', gid: gid, seq: 0}, function(err, result) {
		    if (err) {
		      callback(err, null);
		    } else {
		      callback(null, gid);
		    }
		  });
		}
	      });
	    }
	  });
        }
      });
    }
  });
};

exports.insertCharacter = function(uid, gid, name, detail, pic, font, callback) {
  db.collection('characters', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.update({uid: uid, gid: gid, name: name}, {$set: {detail: detail, picture: pic, font: font}}, {upsert: true}, function(err, result) {
	callback(err);
      });
    }
  });
};

exports.updateData = function(gid, data, callback) {
  db.collection('data', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.update({gid: gid}, {$set: {data: data}}, {upsert: true}, function (err, num) {
	callback(err);
      });
    }
  });
};

exports.updateNote = function(gid, note, callback) {
  db.collection('notes', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.update({gid: gid}, {$set: {note: note}}, {upsert: true}, function (err, num) {
	callback(err);
      });
    }
  });
};

exports.gameList = function(callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.find({}, {_id: 1, gameName: 1}, function(err, curcor) {
	if (err) {
	  callback(err, null);
	} else {
	  curcor.toArray(callback);
	}
      });
    }
  });
};

var deleteGameResource = function(gid, type, callback) {
  db.collection(type, function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.remove({gid:gid}, function(err, num) {
	callback(err);
      });
    }
  });
};

var deleteAllGameResource = function(gid, callback) {
  deleteGameResource(gid, 'events', function(err) {
    if (err) {
      callback(err);
    } else {
      deleteGameResource(gid, 'sounds', function(err) {
	if (err) {
	  callback(err);
	} else {
	  deleteGameResource(gid, 'pictures', function(err) {
	    if (err) {
	      callback(err);
	    } else {
	      deleteGameResource(gid, 'counters', function(err) {
		if (err) {
		  callback(err);
		} else {
		  deleteGameResource(gid, 'characters', function(err) {
		    if (err) {
		      callback(err);
		    } else {
		      deleteGameResource(gid, 'notes', function(err) {
			if (err) {
			  callback(err);
			} else {
			  deleteGameResource(gid, 'data', callback);
			}
		      });
		    }
		  });
		}
	      });
	    }
	  });
	}
      });
    }
  });
};

exports.deleteGame = function(gid, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.remove({_id:gid}, function(err, num) {
	if (err) {
	  callback(err);
	} else {
	  deleteAllGameResource(gid, callback);
	}
      });
    }
  });
};

exports.getGameMember = function(gid, type, callback) {
  db.collection('games', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.findOne({_id:gid}, function(err, item) {
	if (err) {
	  callback(err, null);
	} else {
	  if (!item) {
	    callback(null, null);
	  } else {
	    callback(null, item[type]);
	  }
	}
      });
    }
  });
};

exports.getEvents = function(gid, callback) {
  db.collection('events', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.find({gid: gid}, {sort: [['eid', 1]]}, function (err, curcor) {
	if (err) {
	  callback(err, null);
	} else {
	  curcor.toArray(callback);
	}
      });
    }
  });
};

exports.getFiles = function(gid, type, callback) {
  db.collecntion(type, function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.find({gid:gid}, function(err, curcor) {
	if (err) {
	  callback(err, null);
	} else {
	  curcor.toArray(callback);
	}
      });
    }
  });
};

exports.getCharacters = function(uid, gid, callback) {
  db.collection('characters', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.find({uid: uid, gid: gid}, {name: 1, detail: 1, picture: 1, font: 1}, function(err, curcor) {
	if (err) {
	  callback(err, null);
	} else {
	  curcor.toArray(callback);
	}
      });
    }
  });
};

exports.getAllCharacters = function(gid, callback) {
  db.collection('characters', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.find({gid: gid}, {name: 1, detail: 1, picture: 1, font: 1}, function(err, curcor) {
	if (err) {
	  callback(err, null);
	} else {
	  curcor.toArray(callback);
	}
      });
    }
  });
};

exports.insertEvent = function(gid, eve, callback) {
  generateEventId(gid, function(err, id) {
    if (err) {
      callback(err);
    } else {
      db.collection('events', function(err, col) {
	if (err) {
	  callback(err);
	} else {
	  col.insert({eid: id, gid: gid, event: eve}, function(err, result) {
	    callback(err);
	  });
	}
      });
    }
  });
};

exports.insertSound = function(gid, filename, callback) {
  db.collection('sounds', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.insert({gid: gid, filename: filename}, function(err, result) {
	callback(err);
      });
    }
  });
};

exports.updatePicture = function(gid, filename, bg, avatar, photo, x, y, callback) {
  db.collection('pictures', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.update({gid: gid, filename: filename}, {$set:{background: bg, avatar: avatar, photo: photo, x: x, y: y}}, {upsert: true}, function(err, result) {
	callback(err);
      });
    }
  });
};

exports.setBackground = function(gid, filename, callback) {
  db.collection('pictures', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.update({gid: gid, background: true}, {$set: {background: false}}, function(err, num) {
	if (err) {
	  callback(err, null);
	} else {
	  col.update({gid: gid, filename: filename}, {$set:{background: true}}, function(err, num) {
	    callback(err);
	  });
	}
      });
    }
  });
};

exports.updateAvatar = function(gid, filename, visible, x, y, callback) {
  db.collection('pictures', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.update({gid: gid, filename: filename}, {$set: {avatar: visible, x: x, y: y}}, function(err, num) {
	callback(err);
      });
    }
  });
};

exports.updatePhoto = function(gid, filename, visible, x, callback) {
  db.collection('pictures', function(err, col) {
    if (err) {
      callback(err, null);
    } else {
      col.update({gid: gid, filename: filename}, {$set: {photo: visible, x: x}}, function(err, num) {
        callback(err);
      });
    }
  });
};
