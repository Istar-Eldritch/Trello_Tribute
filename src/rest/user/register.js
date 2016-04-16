'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
* Register a new user.
* Requires the following body {email: String, name: String, password: String}
*/
function register(req, res) {
  User.create(req.body, function(err, result) {
    if(err) {
      res.status(400).json(err);
    } else {
      res.json({msg: 'user created'});
    }
  });
}

module.exports = register;
