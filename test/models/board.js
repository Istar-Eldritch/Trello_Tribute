'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const should = chai.should();
const User = require('../../src/models/user');
const Board = require('../../src/models/board');

describe('User: model', function() {
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


    it('should crate a new board providing a user', function(done) {

      User.create(u, function(err, newUser) {
        let board = R.merge(b, {user: newUser});

        Board.create(board, function(err, newBoard) {
          should.not.exist(err);
          newBoard.name.should.equal(b.name);
          newBoard.owner.name.should.equal(newUser.name);
          should.exist(newBoard.owner.userId);
          done();
        });

      });

    });


    it('should create a new board and user', function(done) {

      let board = R.merge(b, {user: u});

      Board.create(board, function(err, newBoard) {
        should.not.exist(err);
        newBoard.name.should.equal(b.name);
        newBoard.owner.name.should.equal(u.name);
        should.exist(newBoard.owner.userId);
        done();
      });

    });


    it('should create ids for each one of the lists inserted', function(done) {

      let board = R.merge(b, {user: u});

      Board.create(board, function(err, newBoard) {
        should.not.exist(err);
        newBoard.lists[0].name.should.equal(b.lists[0].name);
        should.exist(newBoard.lists[0]._id);
        done();
      });

    });


  });
});
