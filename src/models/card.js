'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Errors = mongoose.Error;
const R = require('ramda');

/**
* Card Schema
*/
const CardSchema = new Schema({
  name: {type: String, required: true},
  desc: String,
  creatorId: {type: ObjectId, required: true},
  creator: {
    id: Schema.Types.ObjectId,
    name: String,
  },
  actions: [],
  boardId: {type: ObjectId, required: true},
  deleted: {type: Boolean, default: false}
});

CardSchema.virtual('listId')
.set(function(listId) {
  this._listId = listId;
})
.get(function() {
  return this._listId;
});


CardSchema.statics.populateActions = function(card) {
  let Action = mongoose.model('Action');
  return Action.find({cardId: card.id})
  .then(function(actions) {
    card.actions = actions;
    return card;
  });
};


/**
* Pre-save
*/
CardSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  let insertCreator = () => {
    if(R.isNil(this.creator) || (R.isNil(this.creator.id) || R.isNil(this.creator.name))) {

      return User.findOne({_id: this.creatorId})
      .then((user) => {
        this.creator = {
          name: user.name,
          id: user.id
        };
        return user;
      });
    } else {
      return new Promise(function(pass, reject) { pass(); });
    }
  };

  let createAction = () => {
    if(R.isNil(this._listId)) {
      let error = new Errors.ValidationError(this);
      error.errors.listId = new Errors.ValidatorError('listId', 'Not valid', 'Not valid', this.listId);
      throw error;
    }

    let Action = mongoose.model('Action');
    return Action.create({
      creatorId: this.creatorId,
      cardId: this.id,
      type: 'creation',
      data: {
        listId: this.listId
      }
    });
  };

  insertCreator()
  .then(createAction)
  .then(done)
  .catch(done);

});

module.exports = mongoose.model('Card', CardSchema);
