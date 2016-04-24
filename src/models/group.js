'use strict';

const mongoose = require('mongoose');
const R = require('ramda');
const Schema = mongoose.Schema;
const Errors = mongoose.Error;
const ObjectId = Schema.Types.ObjectId;
const User = mongoose.model('User');


/**
* Permission Schema
*/
const PermissionSchema = new Schema({
  permission: {type: String, required: true}, // context:id:permission (* wildcard allowed)
  grant: {type: Boolean, default: true}
});

/**
* Group Schema
*/
const GroupSchema = new Schema({
  name: {type: String, require:true},
  creatorId: {type: ObjectId, required: true},
  creator: {
    id: ObjectId,
    name: String
  },
  permissions: [PermissionSchema],
  created: {type: Date, default: Date.now}
});


/**
* Pre-save
*/

PermissionSchema.pre('save', function(done) {
  if(!this.isNew) return done();

  let sections = this.permission.split(':'); // [context, id, permission]
  if(sections.length !== 3) {
    let error = new Errors.ValidationError(this);
    error.errors.permission = new Errors.ValidatorError('permission', 'Not valid', 'Not valid', this.permission);
    //TODO Check for valid contexts, ids and permissions here.
    done(error);
  } else {
    done();
  }
});

GroupSchema.pre('save', function(done) {
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
    }
  };

  insertCreator()
  .then(done)
  .catch(done);
});

module.exports = mongoose.model('Group', GroupSchema);
