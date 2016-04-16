'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = require('./user');

/**
* Board Schema
*/
const BoardSchema = new Schema({
  name: String,
  created: {type: Date, default: Date.now},
  owner: {
    userId: Schema.Types.ObjectId,
    name: String
  },
  lists: [{
    name: String,
    id: {
      type: Schema.Types.ObjectId,
      default: Schema.Types.ObjectId()
    }
  }],
});

/**
* Virtuals
*/
BoardSchema.virtual('user')
.set(function(user) {
  this._user = user;
})
.get(function() {
  return this._user;
});

/**
* Pre-save
*/
BoardSchema.pre('save', function(next) {
  if(!this.isNew) return next();

  // If the owner provided is not a crated user, then create it.
  if(this.user && (this.user instanceof User)) {
    this.owner = {
      name: this.user.name,
      userId: this.user.id
    };
    return next();
  } else {
    User.create(this.user, (err, newUser) => {
      if(err) { throw err; }

      this.owner = {
        name: newUser.name,
        userId: newUser.id
      };

      return next();
    });
  }
});

module.exports = mongoose.model('Board', BoardSchema);
