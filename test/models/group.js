'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const should = chai.should();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Group = mongoose.model('Group');


describe('Group: model', function() {

  var board;
  var user;


// Static samples for testing
  let u = {
    name: 'Ruben Paz',
    email: 'me@ruben.io',
    password: 'testing',
  };

  let b = {
    lists: [{name: "test"}],
    name: 'Test',
    user: u
  };


// ------


  beforeEach(function(done) {

    User.create(u)
    .then(newUser => {
      user = newUser;
      done();
    })
    .catch(done);

  });

  describe('#create()', function() {

    it('should create a new group', function(done) {
      Group.create({
        name: 'Test',
        creatorId: user.id,
      })
      .then(function(newGroup) {
        should.exist(newGroup);
        done();
      })
      .catch(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should create a new group with permissions', function(done) {
      Group.create({
        name: 'Basic',
        creatorId: user.id,
        permissions: [
          {
            permission: `general:${user.id}:*`
          }
        ]
      })
      .then(function(newGroup) {
        should.exist(newGroup);
        done();
      })
      .catch(function(err) {
        should.not.exist(err);
        done();
      });
    });


    it('permissions should be valid', function(done) {
      Group.create({
        name: 'Basic',
        creatorId: user.id,
        permissions: [
          {
            permission: `general:createboard`
          }
        ]
      })
      .then(function(newGroup) {
        should.not.exist(newGroup);
        done();
      })
      .catch(function(err) {
        should.exist(err);
        done();
      });
    });
  });

});
