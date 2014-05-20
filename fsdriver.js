var fs = require('fs');
var rmdir = require('rimraf');

var NGINX_PATH = '/usr/share/nginx/www/';
var SOUND = '/sound';
var PICTURE = '/picture';

exports.createGame = function(gid, callback) {
  fs.mkdir(NGINX_PATH + gid, function(err) {
    if (err) {
      callback(err);
    } else {
      fs.mkdir(NGINX_PATH + gid + SOUND, function (err) {
	if (err) {
	  callback(err);
	} else {
	  fs.mkdir(NGINX_PATH + gid + PICTURE, function(err) {
	    callback(err);
	  });
	}
      });
    }
  });
};

exports.deleteGame = function(gid, callback) {
  rmdir(NGINX_PATH + gid, function(err) {
    callback(err);
  });
};

