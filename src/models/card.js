'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Board = mongoose.model('Board');

/**
* Card Schema
*/
const CardSchema = new Schema({
  name: String,
  desc: String,
  listId: Schema.Types.ObjectId,
  creatorId: Schema.Types.ObjectId,
  boardId: Schema.Types.ObjectId
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
    throw(new Error('Not creatorId or creator supplied'));
  }

  if(this.listId) {
    detailsForListId(this.listId, done);
  } else {
    throw(new Error('No listId supplied'));
  }
});


module.exports = mongoose.model('Card', CardSchema);
