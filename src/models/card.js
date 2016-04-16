'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = require('./user');
const Board = require('./board');

/**
* Card Schema
*/
const CardSchema = new Schema({
  name: String,
  desc: String,
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


CardSchema.virtual('board')
.set(function(board) {
  this._board = board;
})
.get(function() {
  return this._board;
});


/**
* Pre-save
*/
CardSchema.pre('save', function(next) {
  if(!this.isNew) return next();

  // If the owner provided is not a crated user, then create it.
  if(this.creator && (this.creator instanceof User)) {
    this.creatorId = this.creator.id;
  } else if(this.creatorId === undefined) {
    throw(new Error('Not creatorId or creator supplied'));
  }

  if(this.board && (this.board instanceof Board)) {
    this.boardId = this.board.id;
  } else if(this.boardId === undefined) {
    throw(new Error('Not creatorId or creator supplied'));
  }

  return next();
});


module.exports = mongoose.model('Card', CardSchema);
