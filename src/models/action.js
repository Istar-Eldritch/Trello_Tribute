'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Card = mongoose.model('Card');



/**
* Action Schema
*/
const ActionSchema = new Schema({
  creatorId: Schema.Types.ObjectId,
  created: {type: Date, default: Date.now},
  boardId: Schema.Types.ObjectId,
  listId: Schema.Types.ObjectId,
  cardId: Schema.Types.ObjectId,
  type: String, // TODO Define schemas for different types of data
  data: Object // Dynamic content
});

/**
* Virtuals
*/
ActionSchema.virtual('user')
.set(function(user) {
  this._user = user;
  this.creatorId = user.id;
})
.get(function() {
  return this._user;
});

ActionSchema.virtual('board')
.set(function(board) {
  this._board = board;
  this.boardId = board.id;
})
.get(function() {
  return this._board;
});

ActionSchema.virtual('card')
.set(function(card) {
  this._card = card;
  this.cardId = card.id;
  this.boardId = card.boardId;
})
.get(function() {
  return this._card;
});


module.exports = mongoose.model('Action', ActionSchema);
