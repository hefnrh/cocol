var crypto = require('crypto');

var saltLen = 32;
var iterLen = 1024;
var keyLen = 256;
var tokenLen = 32;

exports.encodePassword = function(pw, callback) {
  crypto.randomBytes(saltLen, function(err, buf) {
    if (err) {
      callback(err, null, null);
    } else {
      var salt = buf.toString('base64');
      crypto.pbkdf2(pw, salt, iterLen, keyLen, function(err, key) {
	if (err) {
	  callback(err, null, null);;
        } else {
	  callback(null, key.toString('base64'), salt);
	}
      });
    }
  });
};

exports.encodePasswordWithSalt = function(pw, salt, callback) {
  crypto.pbkdf2(pw, salt, iterLen, keyLen, function(err, key) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, key.toString('base64'));
    }
  });
};

exports.generateToken = function(callback) {
  crypto.randomBytes(tokenLen, function(err, buf) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, buf.toString('base64'));
    }
  });
};
