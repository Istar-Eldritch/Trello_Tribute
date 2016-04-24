'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const should = chai.should();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Board = mongoose.model('Board');

describe('Board: model', function() {
  describe('#create()', function() {

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


    it('should crate a new board providing the creator and the owner', function(done) {

      User.create(u)
      .then(function(newUser) {
        let board = R.merge(b, {creatorId: newUser.id, ownerId: newUser.id});
        return Board.create(board);
      })
      .then(function(newBoard) {
        newBoard.name.should.equal(b.name);
        should.exist(newBoard.ownerId);
        should.exist(newBoard.creatorId);
        done();
      })
      .catch(done);

    });

    it('should create ids for each one of the lists inserted', function(done) {

      let board = R.merge(b, {user: u});
      User.create(u)
      .then(function(newUser) {
        let board = R.merge(b, {creatorId: newUser.id, ownerId: newUser.id});
        return Board.create(board);
      })
      .then(function(newBoard) {
        newBoard.lists[0].name.should.equal(b.lists[0].name);
        should.exist(newBoard.lists[0]._id);
        done();
        })
      .catch(done);
    });


  });
});
