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
const Group = mongoose.model('Group');
const jwt = require('jsonwebtoken');
const R = require('ramda');

const socketUrl = `http://localhost:${PORT}`;
const options = {
  reconnectionDelay: 1
};

const u1 = {
  name: "Ruben",
  email: "testing1@ruben.io",
  password: "testing"
};

const u2 = {
  name: "Ruben",
  email: "testing2@ruben.io",
  password: "testing"
};

const b = {
  name: 'Testing'
};

describe('general: WS Room', function() {

  var token1;
  var token2;
  var user1;
  var user2;

  beforeEach(function(done) {
    User.create(u1)
    .then(function(result) {
      user1 = result;
      token1 = jwt.sign({user: user1.name, id: user1.id, groups: user1.groups}, SECRET, {});
      return User.create(u2);
    })
    .then(function(result){
      user2 = result;
      token2 = jwt.sign({user: user2.name, id: user2.id, groups: user2.groups}, SECRET, {});
    })
    .then(done)
    .catch(done);
  });

  afterEach(function(done) {
    User.remove({})
    .then(function() {
      return Group.remove({});
    })
    .then((succ) => {})
    .then(done)
    .catch(done);
  });

  describe('general:createboard', function() {
    it('should create a new board', function(done) {

      let socket = io.connect(socketUrl, R.merge(options, {query: {token: token1}}));

      socket.on('connect_error', function(err) {
        socket.disconnect();
        should.not.exist(err);
        done();
      });

      socket.on('error', function(err) {
        socket.disconnect();
        should.not.exist(err);
        done();
      });

      socket.on('connect', function() {
        socket.emit('general:createboard', R.merge(b, {ownerId: user1.id}));

        socket.on('general:createboard', function(result) {
          socket.disconnect();
          Board.findOne({id: result.id})
          .then(function(createdboard) {
            should.exist(createdboard);
            done();
          })
          .catch(done);
        });

        socket.on('general:createboard:error', function(err) {
          socket.disconnect();
          should.not.exist(err);
          done();
        });

      });

    });


    it('should notify all the users subscribed to general', function(done) {
      let finalOptions = R.merge(options, {query: {token: token1}});
      let client1 = io.connect(socketUrl, finalOptions);

      client1.on('connect', function() {
        let client2 = io.connect(socketUrl, finalOptions);
        client2.on('connect', function() {
          client1.emit('general:createboard', R.merge(b, {ownerId: user1.id}));

          client2.on('general:createboard', function(result) {
            client1.disconnect();
            client2.disconnect();
            Board.findOne({id: result.id})
            .then(function(createdboard) {
              should.exist(createdboard);
              done();
            })
            .catch(done);
          });
        });

      });
    });


  });


  describe('general:getboards', function() {
    var board;

    beforeEach(function(done) {
      Board.create(R.merge(b, {creatorId: user1.id, ownerId: user1.id}))
      .then(function(newBoard) {
        board = newBoard;
        done();
      })
      .catch(done);
    });

    afterEach(function(done) {
      Board.remove({}, () => {done();});
    });

    it('should return the list of boards', function(done) {
      let finalOptions = R.merge(options, {query: {token: token1}});
      let socket = io.connect(socketUrl, finalOptions);

      socket.on('connect', function(err) {
        socket.emit('general:getboards');
        socket.on('general:getboards', function(boards) {
          board.id.should.equal(boards[0]._id);
          done();
        });
      });
    });
  });
});
