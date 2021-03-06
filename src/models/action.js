'use strict';

const mongoose = require('mongoose');
const R = require('ramda');

const Schema = mongoose.Schema;
const Errors = mongoose.Error;
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Card = mongoose.model('Card');



/**
* Action Schema
*/
const ActionSchema = new Schema({
  creatorId: {type: Schema.Types.ObjectId, required: true},
  creator: {
    id: Schema.Types.ObjectId,
    name: String
  },
  cardId: {type: Schema.Types.ObjectId, required: true},
  created: {type: Date, default: Date.now},
  type: String, // TODO Define schemas for different types of data
  data: Object // Dynamic content
});


/**
* Pre-save
*/
ActionSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  let validateUser = () => {
    if(R.isNil(this.creator) || (R.isNil(this.creator.id) || R.isNil(this.creator.name))) {

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


  validateUser()
  .then(done)
  .catch(done);

});


module.exports = mongoose.model('Action', ActionSchema);
