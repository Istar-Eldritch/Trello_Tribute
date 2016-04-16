'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const should = chai.should();
const User = require('../../src/models/user');
const Board = require('../../src/models/board');
const Card = require('../../src/models/card');


describe('Card: Model', function() {

  let u = {
    name: 'Ruben Paz',
    email: 'me@ruben.io',
    password: 'testing',
  };

  let b = {
    lists: [{name: "Testing"}],
    name: 'Test'
  };

  let c = {
    name: "A testing card",
    desc: "A card for testing"
  };

  var board;
  var user;

  beforeEach(function(done) {

    User.create(u, function(err, newUser) {
      user = newUser;
      Board.create(R.merge(b, {user: user}), function(err, newBoard) {
        board = newBoard;
        done();
      });
    });

  });


  describe('#create()', function() {

    it('should crate a new card providing a board and user', function(done) {
      Card.create(R.merge(c, {board: board, creator: user}), function(err, newCard) {
        should.not.exist(err);
        newCard.desc.should.equal(c.desc);
        should.exist(newCard.creatorId);
        should.exist(newCard.boardId);
        done();
      });
    });

    it('should crate a new card providing a board id and user id', function(done) {
      Card.create(R.merge(c, {creatorId: board.id, boardId: user.id}), function(err, newCard) {
        should.not.exist(err);
        newCard.desc.should.equal(c.desc);
        should.exist(newCard.creatorId);
        should.exist(newCard.boardId);
        done();
      });
    });


  });
});
