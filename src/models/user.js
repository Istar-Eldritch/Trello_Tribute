'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const liftn = require('../common/liftn');

const Schema = mongoose.Schema;
const Errors = mongoose.Error;
const ObjectId = Schema.Types.ObjectId;

/**
* User Schema
*/

const UserSchema = new Schema({
  name: String,
  email: String,
  pwd_hash: String,
  groups: [{type: ObjectId, ref: 'Group'}],
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
*/
UserSchema.methods = {
  authenticate: function(pwd) {
    return liftn(bcrypt.compare.bind(bcrypt), pwd, this.pwd_hash);
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
UserSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  this.id = new ObjectId();

  let hashPassword = () => {
    return new Promise((pass, reject) => {
      if(!(this.password && this.password.length > 5)) {
        let error = new Errors.ValidationError(this);
        error.errors.password = new Errors.ValidatorError('password', 'Not valid', 'Not valid', this.password);
        reject(error);
      }
      else {
        // Hash the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(this.password, salt, (err, hash) => {
            this.pwd_hash = hash;
            pass();
          });
        });
      }
    });
  };

  let setPermissions = () => {
    let Group = mongoose.model('Group');
    return Group.create({
      name: 'Basic',
      creatorId: this.id,
      creator: {
        name: this.name,
        id: this.id
      },
      permissions: [
        {
          permission: `general:${this.id}:*`
        }
      ]
    })
    .then((newGroup) => {
      this.groups.push(newGroup.id);
    });
  };

  hashPassword()
  .then(setPermissions)
  // .then(result => {})
  .then(done)
  .catch(done);

});

// Exports
module.exports = mongoose.model('User', UserSchema);
