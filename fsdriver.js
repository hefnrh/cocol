var fs = require('fs');
var rmdir = require('rimraf');

var NGINX_PATH = '/usr/share/nginx/www/';
var SOUND_PATH = '/sound';
var PICTURE_PATH = '/picture';

exports.createGame = function(gid, callback) {
  fs.mkdir(NGINX_PATH + gid, function(err) {
    if (err) {
      callback(err);
    } else {
      fs.mkdir(NGINX_PATH + gid + SOUND_PATH, function (err) {
	if (err) {
	  callback(err);
	} else {
	  fs.mkdir(NGINX_PATH + gid + PICTURE_PATH, callback);
	}
      });
    }
  });
};

exports.deleteGame = function(gid, callback) {
  rmdir(NGINX_PATH + gid, callback);
};

exports.rename = fs.rename;

exports.uploadDir = NGINX_PATH;
exports.soundDir = SOUND_PATH;
exports.pictureDir = PICTURE_PATH;
