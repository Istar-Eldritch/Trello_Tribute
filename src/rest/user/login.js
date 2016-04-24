'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const SECRET = config.get('jwt_secret');


/**
* Logins the User
* The function expects {email: String, password: String} as the body of the request
* If the payload is valid this endpoints returns {token: String}
* TODO Clean the callback hell with promises or generators
*/
function login (req, res) {
  if(req.body.email && req.body.password) {
    User.findOne({email: req.body.email})
    .exec()
    .then(function(user) {
      return user.authenticate(req.body.password)
      .then(function(success) {
        if(success) {
          return user;
        } else {
          throw Error();
        }
      });
    })
    .then(function(user) {
      return new Promise(function(resolve) {
        jwt.sign({name: user.name, id: user.id, groups: user.groups}, SECRET, {expiresIn: "2d"}, function(token) {
          resolve({token: token});
        });
      });
    })
    .then(function(token) {
      res.json(token);
    })
    .catch(function(err) {
      res.status(400).json({msg: "Invalid user or password"});
    });
  }
  else {
    res.status(400).json({msg: 'password and email required'});
  }
}

module.exports = login;
