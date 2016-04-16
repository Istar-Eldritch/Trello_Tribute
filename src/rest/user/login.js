'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const SECRET = config.get('jwt_secret');

// TODO Clean the callback hell with promises or generators
function login (req, res) {
  if(req.body.email && req.body.password) {
    User.findOne({email: req.body.email}, function(err, user) {
      if(err) {
        res.status(400).json(err);
      } else if(user) {
        user.authenticate(req.body.password, function(err, valid) {
          if(valid) {
            jwt.sign({name: user.name, id: user.id}, SECRET, {expiresIn: "2d"}, function(token) {
              res.json({token: token});
            });
          } else {
            res.status(400).json({msg: 'Invalid pwd or user'});
          }
        });
      } else {
        res.status(400).json({msg: 'Invalid pwd or user'});
      }
    });
  }
  else {
    res.status(400).json({msg: 'Password and user required'});
  }
}

module.exports = login;
