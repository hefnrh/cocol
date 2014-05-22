var db = require('./dbdriver');
var crypter = require('./crypter');
var fs = require('./fsdriver');
var cache = require('./datacache');

var INTERVAL = 60000;
var userList = {};
var gameList = {};

var verifyPW = function(un, pw, callback) {
  db.getUIDPWSalt(un, function(err, uid, pwInDB, salt) {
    if (err) {
      callback(err, null, null);
    } else {
      if (!pwInDB) {
	callback(null, false, null);
      } else {
	crypter.encodePasswordWithSalt(pw, salt, function(err, key) {
	  if (key != pwInDB) {
	    callback(null, false, null);
	  } else {
	    callback(null, true, uid);
	  }
	});
      }
    }
  });
};

var verifyGPW = function(gid, pw, callback) {
  db.getGIDPWSalt(gid, function(err, pwInDB, salt) {
    if (err) {
      callback(err, null);
    } else {
      if (!pwInDB) {
	callback(null, false);
      } else {
	crypter.encodePasswordWithSalt(pw, salt, function(err, key) {
	  if (key != pwInDB) {
	    callback(null, false);
	  } else {
	    callback(null, true);
	  }
	});
      }
    }
  });
};

var isUserOnline = function(token) {
  if (!userList[token]) {
    return false;
  } else {
    userList[token].offline = false;
    return true;
  }
};


exports.signUp = function(un, pw, callback) {
  db.isUsernameExisted(un, function(err, exist) {
    if (err) {
      callback(err, null, null);
    } else {
      if (exist) {
	callback(null, false, null);
      } else {
	crypter.encodePassword(pw, function(err, key, salt) {
	  if (err) {
	    callback(err, null, null);
	  } else {
	    db.insertUser(un, key, salt, function(err, uid) {
	      if (err) {
		callback(err, null, null);
	      } else {
		crypter.generateToken(function(err, token) {
		  if (err) {
		    callback(err, null, null);
		  } else {
		    userList[token] = {offline: false, uid: uid};
		    callback(null, true, token);
		  }
		});
	      }
	    });
	  }
	});
      }
    }
  });
};

exports.changePW = function(un, pw, npw, callback) {
  verifyPW(un, pw, function(err, success) {
    if (err) {
      callback(err, null, null);
    } else {
      if (!success) {
	callback(null, false, null);
      } else {
	crypter.encodePassword(npw, function(err, key, salt) {
	  if (err) {
	    callback(err, null, null);
	  } else {
	    db.changePW(un, key, salt, function(err) {
	      if (err) {
		callback(err, null, null);
	      } else {
		crypter.generateToken(function(err, token) {
		  if (err) {
		    callback(err, null, null);
		  } else {
		    callback(null, true, token);
		  }
		});
	      }
	    });
	  }
	});
      }
    }
  });
};

exports.login = function(un, pw, callback) {
  verifyPW(un, pw, function(err, success, uid) {
    if (err) {
      callback(err, null, null);
    } else {
      if (!success) {
	callback(null, false, null);
      } else {
	crypter.generateToken(function(err, token) {
	  if (err) {
	    callback(err, null, null);
	  } else {
	    userList[token] = {offline: false, uid:uid};
	    callback(null, true, token);
	  }
	});
      }
    }
  });
};

exports.createGame = function(token, name, pw, callback) {
  if (!isUserOnline(token)) {
    callback(null, false, null);
    return;
  }
  db.isGameNameExisted(name, function(err, exist) {
    if (err) {
      callback(err, null, null);
    } else {
      if (exist) {
	callback(null, false, null);
      } else {
	crypter.encodePassword(pw, function(err, key, salt) {
	  if (err) {
	    callback(err, null, null);
	  } else {
	    db.insertGame(userList[token].uid, name, key, salt, function(err, id) {
	      if (err) {
		callback(err, null, null);
	      } else {
		fs.createGame(id, function(err) {
		  if (err) {
		    callback(err, null, null);
		  } else {
		    userList[token].game = id;
		    gameList[id] = 1;
		    callback(null, true, id);
		  }
		});
	      }
	    });
	  }
	});
      }
    }
  });
};

exports.deleteGame = function(token, gid, gpw, callback) {
  if (!isUserOnline(token)) {
    callback(null, false);
    return;
  }
  db.getGameMember(gid, 'user', function(err, user) {
    if (user != userList[token].uid) {
      callback(null, false);
    } else {
      verifyGPW(gid, gpw, function(err, success) {
	if (err) {
	  callback(err, null);
	} else {
	  if (!success) {
	    callback(null, false);
	  } else {
	    db.deleteGame(gid, function(err) {
	      if (err) {
		callback(err, null);
	      } else {
		fs.deleteGame(gid, function(err) {
		  if (err) {
		    callback(err, null);
		  } else {
		    callback(null, true);
		  }
		});
	      }
	    })
	  }
	}
      });
    }
  });
};

exports.joinGame = function(token, gid, gpw, callback) {
  if (!isUserOnline(token)) {
    callback(null, false);
    return;
  }
  verifyGPW(gid, gpw, function(err, success) {
    if (err) {
      callback(err, null);
    } else {
      if (!success) {
	callback(null, false);
      } else {
	db.joinGame(userList[token].uid, gid, function(err, result) {
	  if (err) {
	    callback(err, null);
	  } else {
	    if (userList[token].game >= 0) {
	      --gameList[userList[token].game];
	      if (gameList[userList[token].game] === 0) {
		cache.removeCache(userList[token].game);
		delete gameList[userList[token].game];
	      }
	    }
	    userList[token].game = gid;
	    if (gameList[gid]) {
	      ++gameList[gid];
	    } else {
	      gameList[gid] = 1;
	    }
	    callback(null, true);
	  }
	});
      }
    }
  });
};

setInterval(function() {
  for (var u in userList) {
    if (userList[u].offline) {
      if (gameList[userList[u].game]) {
	--gameList[userList[u].game];
	if (!gameList[userList[u].game]) {
	  cache.removeCache(userList[u].game);
	  delete gameList[userList[u].game];
	}
      }
      delete userList[u];
    } else {
      userList[u].offline = true;
    }
  }
}, INTERVAL);
