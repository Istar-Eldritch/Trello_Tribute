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


describe('board: WS Room', function() {
  var token1;
  var token2;
  var user1;
  var user2;
  var board;
  var channel;
  beforeEach(function(done) {
    User.create(u1, function(err, result) {
      if(err) {throw err; }
      user1 = result;
      token1 = jwt.sign({user: user1.name, id: user1.id}, SECRET, {});
      User.create(u2, function(err, result) {
        user2 = result;
        token2 = jwt.sign({user: user2.name, id: user2.id}, SECRET, {});
        Board.create(R.merge(b, {user: user1}), function(err, b) {
          board = b;
          channel = `board:${board.id}`;
          done();
        });
      });
    });
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
        client1.emit(`board:watch`, board.id);

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
        client1.emit(`board:watch`, board.id);

        client2.on('connect', function(err) {
          client2.emit(`board:watch`, board.id);
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

});
