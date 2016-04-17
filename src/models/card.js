'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Errors = mongoose.Error;

/**
* Card Schema
*/
const CardSchema = new Schema({
  name: {type: String, required: true},
  desc: String,
  listId: Schema.Types.ObjectId,
  creatorId: Schema.Types.ObjectId,
  boardId: Schema.Types.ObjectId,
  deleted: {type: Boolean, default: false}
});


/**
* Virtuals
*/
CardSchema.virtual('creator')
.set(function(creator) {
  this._creator = creator;
})
.get(function() {
  return this._creator;
});

/**
* Pre-save
*/
CardSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  // Gets the id of the list and fills the boardId and the listId from the scope
  let detailsForListId = (id, done) => {
    this.listId = id;
    if(this.boardId === undefined) {
      Board.findOne({lists: {$elemMatch: {_id: id}}}, (err, result) => {
        this.boardId = result.id;
        done();
      });
    } else { done(); }
  };

  // If the owner provided is not a crated user, then create it.
  if(this.creator && (this.creator instanceof User)) {
    this.creatorId = this.creator.id;
  } else if(this.creatorId === undefined) {
    let error = new Errors.ValidationError(this);
    error.errors.creatorId = new Errors.ValidatorError('creatorId', 'Not supplied', 'Not valid', this.creatorId);
    done(error);
  }

  if(this.listId) {
    detailsForListId(this.listId, done);
  } else {
    let error = new Errors.ValidationError(this);
    error.errors.listId = new Errors.ValidatorError('listId', 'Not supplied', 'Not valid', this.listId);
    done(error);
  }
});

/**
* Post Save
*/
CardSchema.post('save', function() {
  const Action = mongoose.model('Action');
  Action.create({
    creatorId: this.creatorId,
    cardId: this.id,
    boardId: this.boardId,
    listId: this.listId,
    type: 'creation'
  })
});

module.exports = mongoose.model('Card', CardSchema);
