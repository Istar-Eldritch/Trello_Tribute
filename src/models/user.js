'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

/**
* User Schema
*/

const UserSchema = new Schema({
  name: String,
  email: String,
  pwd_hash: String,
  created: {type: Date, default: Date.now}
});

/**
* Virtuals
*/
UserSchema.virtual('password')
.set(function(password) {
  this._password = password;
})
.get(function() {
  return  this._password;
});

/**
* Methods
* TODO Do this async
*/
UserSchema.methods = {
  authenticate: function(pwd, cb) {
    bcrypt.compare(pwd, this.pwd_hash, cb);
  }
};

/**
* Validations
*/
UserSchema.path('email').validate(name => {return name.length;});

UserSchema.path('email').validate(function (email, cb) {
  const User = mongoose.model('User');

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.count({email: email}).exec(function (err, matches) {
      cb(!err && matches === 0);
    });
  } else cb(true);
}, 'Email already exists');

/**
* Pre-save
*/
UserSchema.pre('save', function(next) {
  if(!this.isNew) return next();

  if(!(this.password && this.password.length > 5)) {
    next(new Error('Invalid password'));
  }
  else {
    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        this.pwd_hash = hash;
        next();
      });
    });
  }
});

// Exports
module.exports = mongoose.model('User', UserSchema);
