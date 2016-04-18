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

const u = {
  name: "Ruben",
  email: "testing@ruben.io",
  password: "testing"
};

const b = {
  name: 'Testing'
};

describe('general: WS Room', function() {

  var token;
  var user;

  beforeEach(function(done) {
    User.create(u, function(err, result) {
      if(err) {throw err; }
      user = result;
      token = jwt.sign({user: user.name, id: user.id}, SECRET, {});
      done();
    });
  });

  afterEach(function(done) {
    User.remove({_id: user.id}, function() {
      done();
    });
  });

  describe('general:createboard', function() {
    it('should create a new board', function(done) {

      let socket = io.connect(socketUrl, R.merge(options, {query: {token: token}}));

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
        socket.emit('general:createboard', b);

        socket.on('general:createboard', function(result) {
          socket.disconnect();
          Board.findOne({id: result.id}, function(err, createdboard) {
            should.exist(createdboard);
            done();
          });
        });

        socket.on('general:createboard:error', function(err) {
          socket.disconnect();
          should.not.exist(err);
          done();
        });

      });

    });


    it('should notify all the users subscribed to general', function(done) {
      let finalOptions = R.merge(options, {query: {token: token}});
      let client1 = io.connect(socketUrl, finalOptions);

      client1.on('connect', function() {
        let client2 = io.connect(socketUrl, finalOptions);
        client2.on('connect', function() {
          client1.emit('general:createboard', b);

          client2.on('general:createboard', function(result) {
            client1.disconnect();
            client2.disconnect();
            Board.findOne({id: result.id}, function(err, createdboard) {
              should.exist(createdboard);
              done();
            });
          });
        });

      });
    });


  });


  describe('general:getboards', function() {
    var board;

    beforeEach(function(done) {
      Board.create(R.merge(b, {user: user}), function(err, newBoard) {
        board = newBoard;
        done();
      });
    });

    afterEach(function(done) {
      Board.remove({}, () => {done();});
    });

    it('should return the list of boards', function(done) {
      let finalOptions = R.merge(options, {query: {token: token}});
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
