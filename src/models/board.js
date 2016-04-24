'use strict';

const mongoose = require('mongoose');
const R = require('ramda');

const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Errors = mongoose.Error;


/**
* List Schema
*/
const ListSchema = new Schema({
  name: {type: String, required: true}
});

/**
* Board Schema
*/
const BoardSchema = new Schema({
  name: {type: String, required: true},
  created: {type: Date, default: Date.now},
  ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  creatorId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  lists: [ListSchema]
});


module.exports = mongoose.model('Board', BoardSchema);
