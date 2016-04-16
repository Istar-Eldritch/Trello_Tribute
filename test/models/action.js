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
    name: 'Test',
    user: u
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

    User.create(u, function(err, newUser) {
      user = newUser;
      Board.create(R.merge(b, {user: user}), function(err, newBoard) {
        board = newBoard;
        Card.create(R.merge(c, {listId: board.lists[0]._id, creator: user}), function(err, newCard) {
          card = newCard;
          done();
          //TODO Refactor all this stuff to promises
        });

      });
    });

  });


  describe('#create()', function() {


    it('create a new action for a specific card', function(done) {
      Action.create(R.merge(a, {user: user, board:board, card: card}), function(err, newAction) {
        should.not.exist(err);
        should.exist(newAction.creatorId);
        // newAction.creator.id.should.equal(user.id);
        newAction.boardId.toString().should.equal(board.id.toString());
        newAction.cardId.toString().should.equal(card.id.toString());
        done();
      });
    });


  });
});
