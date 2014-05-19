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
	  if (item != null) {
	    callback(null, true);
	  } else {
	    callback(null, false);
	  }
	}
      });
    }
  });
};

exports.getIDPWSalt = function(un, callback) {
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

exports.changePW = function(un, npw, nsalt, callback) {
  db.collection('users', function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.update({username: un}, {$set: {password: npw, salt: nsalt}}, function(err, result) {
	if (err) {
	  callback(err);
	} else {
	  callback(null);
	}
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
	  if (item != null) {
	    callback(null, true);
	  } else {
	    callback(null, false);
	  }
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
      col.update({_id: gid}, {$addToSet: {player: uid}}, function(err, result) {
	if (err) {
	  callback(err, null);
	} else {
	  callback(null, result);
	}
      });
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
	      callback(null, gid);
	    }
	  });
        }
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
	  curcor.toArray(function(err, docs) {
	    if (err) {
	      callback(err, null);
	    } else {
	      callback(null, docs);
	    }
	  });
	}
      });
    }
  });
};

