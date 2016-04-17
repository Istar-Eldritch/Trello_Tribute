'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const should = chai.should();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const Card = mongoose.model('Card');
const Action = mongoose.model('Action');

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

    it('should create a new card providing a list and user', function(done) {
      Card.create(R.merge(c, {listId: board.lists[0]._id, creator: user}), function(err, newCard) {
        should.not.exist(err);
        newCard.desc.should.equal(c.desc);
        should.exist(newCard.creatorId);
        should.exist(newCard.boardId);
        should.exist(newCard.listId);
        done();
      });
    });

    it('should create a new card providing a list id and user id', function(done) {
      Card.create(R.merge(c, {creatorId: user.id, listId: board.lists[0]._id}), function(err, newCard) {
        should.not.exist(err);
        newCard.desc.should.equal(c.desc);
        should.exist(newCard.creatorId);
        should.exist(newCard.boardId);
        should.exist(newCard.listId);
        done();
      });
    });


    it('should create the first action after creation with the user id', function(done) {
      Card.create(R.merge(c, {creatorId: user.id, listId: board.lists[0]._id}), function(err, newCard) {
        should.not.exist(err);
        Action.findOne({cardId: newCard.id}, function(err, action) {
          should.not.exist(err);
          should.exist(action);
          action.creatorId.toString().should.equal(newCard.creatorId.toString());
          action.type.should.equal('creation');
          done();
        });

      });
    });


  });
});
