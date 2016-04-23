'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
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
  listId: Schema.Types.ObjectId,
  creatorId: Schema.Types.ObjectId,
  creator: {
    id: Schema.Types.ObjectId,
    name: String,
  },
  actions: [{
    type: Schema.Types.ObjectId,
    ref: 'Action'
  }],
  boardId: Schema.Types.ObjectId,
  deleted: {type: Boolean, default: false}
});


/**
* Pre-save
*/
CardSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  // Gets the id of the list and fills the boardId and the listId from the scope
  let validateList = () => {
    if(R.isNil(this.listId)){
      return new Promise((resolve, reject) => {
        let error = new Errors.ValidationError(this);
        error.errors.listId = new Errors.ValidatorError('listId', 'Not supplied', 'Not valid', this.listId);
        reject(error);
      });
    } else {
      if(this.boardId === undefined) {
        return Board.findOne({lists: {$elemMatch: {_id: this.listId}}})
        .then((result) => {
          this.boardId = result.id;
          return result;
        });
      }
    }
  };

  let validateUser = () => {
    if(R.isNil(this.creatorId)) {
      return new Promise((resolve, reject) => {
        let error = new Errors.ValidationError(this);
        error.errors.creatorId = new Errors.ValidatorError('creatorId', 'Not supplied', 'Not valid', this.creatorId);
        reject(error);
      });
    } else if(R.isNil(this.creator) || (R.isNil(this.creator.id) || R.isNil(this.creator.name))) {

      return User.findOne({_id: this.creatorId})
      .then((user) => {
        this.creator = {
          name: user.name,
          id: user.id
        };
        return user;
      });
    }
  };

  let createAction = () => {
    let Action = mongoose.model('Action');
    return Action.create({
      creatorId: this.creatorId,
      cardId: this.id,
      type: 'creation'
    })
    .then((newAction) => {
      this.actions.push(newAction.id);
    });
  };

  validateUser()
  .then(validateList)
  .then(createAction)
  .then(done)
  .catch(done);

});

module.exports = mongoose.model('Card', CardSchema);
