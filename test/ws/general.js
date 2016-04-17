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
          })
        });

        socket.on('general:createboard:error', function(err) {
          socket.disconnect();
          should.not.exist(err);
          done();
        });

      });

    });
  });
});
