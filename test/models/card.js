'use strict';

require('../dbprepare');
const chai = require('chai');
const R = require('ramda');
const liftn = require('../../src/common/liftn');
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

    User.create(u)
    .then(function(newUser) {
      user = newUser;
      return Board.create(R.merge(b, {ownerId: user.id, creatorId: user.id}));
    })
    .then(function(newBoard) {
      board = newBoard;
      done();
    })
    .catch(done);

  });


  describe('#create()', function() {

    it('should create a new card providing a list and user', function(done) {
      Card.create(R.merge(c, {boardId: board.id, listId: board.lists[0]._id, creatorId: user.id}), function(err, newCard) {
        should.not.exist(err);
        newCard.desc.should.equal(c.desc);
        should.exist(newCard.creatorId);
        should.exist(newCard.creator);
        should.exist(newCard.creator.id);
        should.exist(newCard.creator.name);
        should.exist(newCard.boardId);
        should.exist(newCard.listId);
        done();
      });
    });


    it('should create the first action after creation with the user id', function(done) {
      Card.create(R.merge(c, {boardId: board.id, creatorId: user.id, listId: board.lists[0]._id}))
      .then(Card.populateActions)
      .then(function(newCard) {
        let action = newCard.actions[0];
        should.exist(action);
        action.type.should.equal('creation');
        done();
      });
    });


    it('should have the list of actions embedded in the card', function(done) {
      Card.create(R.merge(c, {boardId: board.id, creatorId: user.id, listId: board.lists[0]._id}))
      .then(Card.populateActions)
      .then(function(newCard) {
        should.exist(newCard);
        should.exist(newCard.actions);
        (newCard.actions instanceof Array).should.equal(true);
        should.exist(newCard.actions[0]);
        done();
      })
      .catch(done);
    });

  });
});
