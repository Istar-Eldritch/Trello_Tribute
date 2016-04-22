'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Errors = mongoose.Error;
/**
* Board Schema
*/
const BoardSchema = new Schema({
  name: {type: String, required: true},
  created: {type: Date, default: Date.now},
  ownerId: Schema.Types.ObjectId,
  owner: {
    id: Schema.Types.ObjectId,
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
      id: this.user.id
    };
    this.ownerId = this.user.id;
    return next();
  }

  if(!(this.owner.id && this.owner.id instanceof Schema.Types.ObjectId)) {
    let error = new Errors.ValidationError(this);
    error.errors.password = new Errors.ValidatorError('owner.id', 'Not valid', 'Not valid', this.owner || this.owner.id);
    next(error);
  }

  if(!this.owner.name) {
    let error = new Errors.ValidationError(this);
    error.errors.password = new Errors.ValidatorError('owner.name', 'Not valid', 'Not valid', this.owner || this.owner.name);
    next(error);
  }

  this.lists = this.lists.map(elem => {
    if(elem.id === undefined) {
      return {
        name: elem.name,
        id: Schema.Types.ObjectId()
      };
    } else {
      return elem;
    }
  });
});

module.exports = mongoose.model('Board', BoardSchema);
