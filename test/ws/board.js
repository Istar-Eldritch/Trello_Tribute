'use strict';

require('../serverprepare');
require('../dbprepare');

const chai = require('chai');
const should = chai.should();
const io = require('socket.io-client');
const config = require('config');
const PORT = config.get('port');
const SECRET = config.get('jwt_secret');
const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const User = mongoose.model('User');
const Card = mongoose.model('Card');
const jwt = require('jsonwebtoken');
const R = require('ramda');

const socketUrl = `http://localhost:${PORT}`;
const options = {
  reconnectionDelay: 1
};

const u1 = {
  name: "Ruben",
  email: "testing@ruben.io",
  password: "testing"
};

const u2 = {
  name: "Ruben",
  email: "testiten@ruben.io",
  password: "testing"
};

const b = {
  name: 'Testing'
};

const c = {
  name: "Testing card",
  desc: "Just a card to test the behaviour"
};


describe('board: WS Room', function() {
  var token1;
  var token2;
  var user1;
  var user2;
  var board;
  var channel;
  beforeEach(function(done) {
    User.create(u1)
    .then(function(result) {
      user1 = result;
      token1 = jwt.sign({user: user1.name, id: user1.id}, SECRET, {});
      return User.create(u2);
    })
    .then(function(result) {
      user2 = result;
      token2 = jwt.sign({user: user2.name, id: user2.id}, SECRET, {});
      return Board.create(R.merge(b, {creatorId: user1.id, ownerId: user1.id}));
      })
    .then(function(result) {
      board = result;
      channel = `context:${board.id}`;
      done();
    })
    .catch(done);
  });

  afterEach(function(done) {
    User.remove({}, function() {
      Board.remove({}, function() {
        done();
      });
    });
  });


  describe('board:id:watch', function() {


    it('should notify the user', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        client1.emit(`context:watch`, 'board', board.id);

        client1.on(`${channel}:watch`, function(update) {
          client1.disconnect();
          update.new.id.should.equal(user1.id);
          done();
        });

      });
    });


    it('should notify all the users in the room', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        let client2 = io.connect(socketUrl, R.merge(options, {query: {token: token2}}));
        client1.emit(`context:watch`, 'board', board.id);

        client2.on('connect', function(err) {
          client2.emit(`context:watch`, 'board', board.id);
          client1.on(`${channel}:watch`, function(update) {
            update.list.length.should.equal(2);
            client1.disconnect();
            client2.disconnect();
            update.new.id.should.equal(user2.id);
            done();
          });
        });

      });
    });


  });


  describe('board:id:updateboard', function() {


    it('should be able to add a list', function(done) {
      let socket = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      socket.on('connect', function(err) {
        socket.emit(`context:watch`, 'board', board.id);

        socket.on(`${channel}:watch`, function(update) {
          socket.emit(`${channel}:updateboard`, {lists: [{name: 'Testing'}]} );
          socket.on(`${channel}:updateboard`, function(newBoard) {
            socket.disconnect();
            should.exist(newBoard.lists[0]);
            should.exist(newBoard.lists[0]._id);
            newBoard.lists[0].name.should.equal('Testing');
            done();
          });

          socket.on(`${channel}:update:error`, function(err) {
            socket.disconnect();
            should.not.exist(err);
            done();
          });
        });

      });
    });


    it('should notify all the users watching', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        client1.emit(`context:watch`, 'board', board.id);

        client1.on(`${channel}:watch`, function(update) {
          let client2 = io.connect(socketUrl, R.merge(options, {query: {token: token2}}));

          client2.on('connect', function(err) {
            client2.emit(`context:watch`, 'board', board.id);

            client2.on(`${channel}:watch`, function(update) {
              client1.emit(`${channel}:updateboard`, {name: 'Another'} );
              client2.on(`${channel}:updateboard`, function(newBoard) {
                client1.disconnect();
                client2.disconnect();

                newBoard.name.should.equal('Another');
                done();
              });
            });
          });

        });

      });
    });


  });


  describe('board:id:createcard', function() {

    beforeEach(function(done) {
      board.lists = [{name: 'Testing List'}];
      board.save(function(err) {
        if(err) {throw err;}
        done();
      });
    });


    it('should be able to create a card', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        client1.emit(`context:watch`, 'board', board.id);
        client1.on(`${channel}:watch`, function(update) {
          client1.emit(`${channel}:createcard`, R.merge(c, {listId: board.lists[0]._id}));
          client1.on(`${channel}:createcard`, function(card) {
            client1.disconnect();
            should.exist(card);
            done();
          });
        });
      });
    });


    it('should notify all the users watching', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        client1.emit(`context:watch`, 'board', board.id);

        client1.on(`${channel}:watch`, function(update) {
          let client2 = io.connect(socketUrl, R.merge(options, {query: {token: token2}}));

          client2.on('connect', function(err) {
            client2.emit('context:watch', 'board', board.id);

            client2.on(`${channel}:watch`, function(update) {
              client1.emit(`${channel}:createcard`, R.merge(c, {listId: board.lists[0]._id}));
              client2.on(`${channel}:createcard`, function(newCard) {
                client1.disconnect();
                client2.disconnect();

                newCard.name.should.equal(c.name);
                done();
              });
            });
          });

        });

      });
    });

  });

  describe('board:id:createaction', function() {
    var card;

    beforeEach(function(done) {
      board.lists = [{name: 'Testing List'}];
      board.save(function(err) {
        if(err) {throw err;}
        Card.create(R.merge(c, {
          listId: board.lists[0]._id,
          boardId: board.id,
          creatorId: user1.id}), function(err, newCard) {
            card = newCard;
            done();
          });
      });
    });


    it('should create a new action', function(done) {
      let client1 = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      client1.on('connect', function(err) {
        client1.emit(`context:watch`, 'board', board.id);
        client1.on(`${channel}:watch`, function(update) {
          client1.emit(`${channel}:createaction`, R.merge(c, {
            cardId: card.id,
            type: 'comment',
            data: {
              text: 'This is a comment in a card'
            }
          }));
          client1.on(`${channel}:createaction`, function(action) {
            client1.disconnect();
            should.exist(action);
            action.creatorId.should.equal(user1.id);
            action.type.should.equal('comment');
            should.exist(action.data.text);
            done();
          });
        });
      });
    });


  });


  describe('board:id:getcards', function() {

    var card;

    beforeEach(function(done) {
      board.lists = [{name: 'Testing List'}];
      board.save(function(err) {
        if(err) {throw err;}
        Card.create(R.merge(c, {
          listId: board.lists[0]._id,
          boardId: board.id,
          creatorId: user1.id}), function(err, newCard) {
            card = newCard;
            done();
          });
      });
    });

    it('should return the list of cards', function(done) {
      let socket = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      socket.on('connect', function(err) {
        socket.emit('context:watch', 'board', board.id);
        socket.on(`${channel}:watch`, function(update) {
          socket.emit(`${channel}:getcards`);
          socket.on(`${channel}:getcards`, function(cards) {
            card.id.should.equal(cards[0]._id);
            done();
          });
        });

      });
    });

    it('returns a list of actions embedded in the card', function(done) {
      let socket = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      socket.on('connect', function(err) {
        socket.emit('context:watch', 'board', board.id);
        socket.on(`${channel}:watch`, function(update) {
          socket.emit(`${channel}:getcards`);
          socket.on(`${channel}:getcards`, function(cards) {
            should.exist(cards[0]);
            card.id.should.equal(cards[0]._id);
            should.exist(cards[0].actions);
            cards[0].actions[0].type.should.equal('creation');

            done();
          });
        });

      });
    });


  });


});
