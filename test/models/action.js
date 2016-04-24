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
const liftn = require('../../src/common/liftn');

describe('Action: model', function() {

  var board;
  var user;
  var card;


// Static samples for testing
  let u = {
    name: 'Ruben Paz',
    email: 'me@ruben.io',
    password: 'testing',
  };

  let b = {
    lists: [{name: "test"}],
    name: 'Test'
  };

  let c = {
    name: "A testing card",
    desc: "A card for testing"
  };

  let a = {
    type: "Comment",
    data: {
      text: "Just a comment for testing"
    }
  };


// ------


  beforeEach(function(done) {

    function createBoardWithUser(newUser) {
      user = newUser;
      return Board.create(R.merge(b, {ownerId: user.id, creatorId: user.id}));
    }

    function createCardWithBoard(newBoard) {
      board = newBoard;
      return Card.create(R.merge(c, {boardId: board.id, listId: board.lists[0]._id, creatorId: user.id}));
    }

    User.create(u)
    .then(createBoardWithUser)
    .then(createCardWithBoard)
    .then((newCard) => {
      card = newCard;
    })
    .then(done)
    .catch(done);

  });


  describe('#create()', function() {


    it('create a new action for a specific card', function(done) {
      Action.create(R.merge(a, {creatorId: user.id, cardId: card.id}), function(err, newAction) {
        should.not.exist(err);
        should.exist(newAction.creatorId);
        should.exist(newAction.creator);
        should.exist(newAction.creator.id);
        should.exist(newAction.creator.name);
        done();
      });
    });

    it('throw an error when no cardId is specified', function(done) {
      Action.create(R.merge(a, {creatorId: user.id}), function(err, newAction) {
        should.exist(err);
        done();
      });
    });

    it('throw an error when no creatorId is specified', function(done) {
      Action.create(R.merge(a, {cardId: card.id}), function(err, newAction) {
        should.exist(err);
        done();
      });
    });

  });
});
