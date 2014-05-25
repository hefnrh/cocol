var http = require('http');
var url = require('url');
var statechecker = require('./statechecker');
var db = require('./dbdriver');

var ERROR = 0;
var OK = 1;

var loadJsonData = function(req, callback) {
  var data = '';
  req.on('data', function(chuck) {
    data += chuck;
  });
  req.on('end', function() {
    var jsonData = null;
    try {
      jsonData = JSON.parse(data);
    } catch (err) {
      callback(err, null);
      return;
    }
    callback(null, jsonData);
  });
};

var signUp = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.username || !data.password) {
        res.end(JSON.stringify({result: ERROR, message: 'post username and password'}));
      } else {
        statechecker.signUp(data.username, data.password, function(err, success, newToken) {
          if (err) {
            res.end(JSON.stringify({result: ERROR, message: 'server error'}));
          } else {
            if (success) {
              res.end(JSON.stringify({result: OK, token: newToken, message: 'sign up success'}));
            } else {
              res.end(JSON.stringify({result: ERROR, message: 'username already in use'}));
            }
          }
        });
      }
    }
  });
}

var changePW = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.username || !data.password || !data.newPassword) {
	res.end(JSON.stringify({result: ERROR, message: 'post username,  password and new password'}));
      } else {
	statechecker.changePW(data.username, data.password, data.newPassword, function(err, success, newToken) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (!success) {
	      res.end(JSON.stringify({result: ERROR, message: 'username or password wrong'}));
	    } else {
	      res.end(JSON.stringify({result: OK, token: newToken, message: 'change password success'}));
	    }
	  }
	});
      }
    }
  });
};

var login = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.username || !data.password) {
	res.end(JSON.stringify({result: ERROR, message: 'post username and password'}));
      } else {
	statechecker.login(data.username, data.password, function(err, success, newToken) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (success) {
	      res.end(JSON.stringify({result: OK, token: newToken, message: 'login success'}));
	    } else {
	      res.end(JSON.stringify({result: ERROR, message: 'username or password wrong'}));
	    }
	  }
	});
      }
    }
  });
};

var createGame = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gamePassword || !data.gameName) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, game name and game password'}));
      } else {
	statechecker.createGame(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameName, data.gamePassword, function(err, success, id) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (!success) {
	      res.end(JSON.stringify({result: ERROR, message: 'name has been used or login out of date'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'create game success', gameID: id}));
	    }
	  }
	});
      }
    }
  });
};

var deleteGame = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gamePassword || !data.gameID) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, game password and game id'}));
      } else {
	statechecker.deleteGame(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, data.gamePassword, function(err, success) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (!success) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of data or you are not creater of the game'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'delete game success'}));
	    }
	  }
	});
      }
    }
  });
};	      

var joinGame = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gamePassword || !data.gameID) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, game password and game id'}));
      } else {
	statechecker.joinGame(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, data.gamePassword, function(err, success) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (!success) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of date or game password wrong'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'enter game success'}));
	    }
	  }
	});
      }
    }
  });
};

var getCharacter = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID) {
	res.end(JSON.stringify({result: ERROR, message: 'post token and game id'}));
      } else {
	statechecker.getCharacter(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, function(err, characters) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (characters == null) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'enter game success', characterList: characters}));
	    }
	  }
	});
      }
    }
  });
};


var getAllCharacters = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID) {
	res.end(JSON.stringify({result: ERROR, message: 'post token and game id'}));
      } else {
	statechecker.getAllCharacters(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, function(err, characters) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (characters == null) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'enter game success', characterList: characters}));
	    }
	  }
	});
      }
    }
  });
};

var getFiles = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID || (!data.type && data.type !== 0)) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, game id and type'}));
      } else {
	var ret = {result: OK, message: 'enter game success'};
	data.token = decodeURIComponent(data.token).replace(/ /g, '+');
	switch (data.type) {
	  case 0:
	    statechecker.getFiles(data.token, data.gameID, 'pictures', function(err, pics) {
	      if (err) {
	        res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	      } else {
		if (pics == null) {
		  res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
		} else {
		  ret.pictures = pics;
		  statechecker.getFiles(data.token, data.gameID, 'sounds', function(err, sounds) {
		    if (err) {
		      res.end(JSON.stringify({result: ERROR, message: 'server error'}));
		    } else {
		      if (sounds == null) {
			res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
		      } else {
			ret.sounds = sounds;
			res.end(JSON.stringify(ret));
		      }
		    }
		  });
		}
	      }
	    });
	    break;
	  case 1:
	    statechecker.getFiles(data.token, data.gameID, 'pictures', function(err, pics) {
	      if (err) {
		res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	      } else {
		if (pics == null) {
		  res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
		} else {
		  ret.pictures = pics;
		  res.end(JSON.stringify(ret));
		}
	      }
	    });
	    break;
	  case 2:
	    statechecker.getFiles(data.token, data.gameID, 'sounds', function(err, sounds) {
	      if (err) {
		res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	      } else {
		if (sounds == null) {
		  res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
		} else {
		  ret.sounds = sounds;
		  res.end(JSON.stringify(ret));
		}
	      }
	    });
	    break;
	  default: res.end(JSON.stringify({result: ERROR, message: 'undefined operation'}));
	}
      }
    }
  });
};

var leaveGame = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID) {
	res.end(JSON.stringify({result: ERROR, message: 'post token and game id'}));
      } else {
	statechecker.leaveGame(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, function(err, success) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    res.end(JSON.stringify({result: OK, message: 'leave game success'}));
	  }
	});
      }
    }
  });
};

var fetch = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID || (!data.startEventID && data.startEventID !== 0)) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, start id and game id'}));
      } else {
	statechecker.getEvents(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, data.startEventID, function(err, list) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (list == null) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'fetch event success', eventList: list}));
	    }
	  }
	});
      }
    }
  });
};

var post = function(req, res) {
  loadJsonData(req, function(err, data) {
    if (err) {
      res.end(JSON.stringify({result: ERROR, message: 'data format error'}));
    } else {
      if (!data.token || !data.gameID || !data.event) {
	res.end(JSON.stringify({result: ERROR, message: 'post token, event and game id'}));
      } else {
	statechecker.postEvent(decodeURIComponent(data.token).replace(/ /g, '+'), data.gameID, data.event, function(err, success) {
	  if (err) {
	    res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	  } else {
	    if (success === false) {
	      res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	    } else {
	      res.end(JSON.stringify({result: OK, message: 'post event success'}));
	    }
	  }
	});
      }
    }
  });
};

http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  switch (parsedUrl.pathname) {
    case '/coc/gamelist':
      db.gameList(function(err, games) {
	if (err) {
	  res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	} else {
	  res.end(JSON.stringify({result: OK, message: 'get list success', gameList: games}));
	}
      });
      break;
    case '/coc/signup':
      signUp(req, res);
      break;
    case '/coc/login':
      login(req, res);
      break;
    case '/coc/changepw':
      changePW(req, res);
      break;
    case '/coc/creategame':
      createGame(req, res);
      break;
    case '/coc/deletegame':
      deleteGame(req, res);
      break;
    case '/coc/entergame':
      joinGame(req, res);
      break;
    case '/coc/getcharacter':
      getCharacter(req, res);
      break;
    case '/coc/getallcharacters':
      getAllCharacters(req, res);
      break;
    case '/coc/resources':
      getFiles(req, res);
      break;
    case '/coc/leavegame':
      leaveGame(req, res);
      break;
    case '/coc/fetch':
      fetch(req, res);
      break;
    case '/coc/post':
      post(req, res);
      break;
    case '/coc/getcharacter':
      getCharacter(req, res);
      break;
    case '/coc/getallcharacters':
      getAllCharacters(req, res);
      break;
    case '/coc/uploadpic':
      statechecker.uploadPic(decodeURIComponent(parsedUrl.query.token).replace(/ /g, '+'), parseInt(parsedUrl.query.gameid), req, function(err, success) {
	if (err) {
	  res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	} else if (!success) {
	  res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	} else {
	  res.end(JSON.stringify({result: OK, message: 'upload picture success'}));
	}
      });
      break;
    case '/coc/uploadsound':
      statechecker.uploadSound(decodeURIComponent(parsedUrl.query.token).replace(/ /g, '+'), parseInt(parsedUrl.query.gameid), req, function(err, success) {
	if (err) {
	  res.end(JSON.stringify({result: ERROR, message: 'server error'}));
	} else if (!success) {
	  res.end(JSON.stringify({result: ERROR, message: 'login out of date or you are not in the game'}));
	} else {
	  res.end(JSON.stringify({result: OK, message: 'upload sound success'}));
	}
      });
      break;
    default: res.end(JSON.stringify({result: ERROR, message: 'operation not found'}));
  }
}).listen(8080);


