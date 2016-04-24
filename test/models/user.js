'use strict';

require('../dbprepare');
const chai = require('chai');
const should = chai.should();
const mongoose = require('mongoose');
const User = mongoose.model('User');

describe('User: model', function() {

  let u = {
    name: 'Ruben Paz',
    email: 'me@ruben.io',
    password: 'testing',
  };


  describe('#create()', function() {

    it('should crate a new user', function(done) {
      User.create(u, function(err, newUser) {
        should.not.exist(err);
        newUser.name.should.equal(u.name);
        newUser.email.should.equal(u.email);
        should.exist(newUser.created);
        done();
      });
    });

    it('User must have a password hash', function(done) {
      User.create(u, function(err, newUser) {
        should.not.exist(err);
        should.exist(newUser.pwd_hash);
        newUser.pwd_hash.should.not.equal(u.password);
        done();
      });
    });

    it('User email must be unique', function(done) {
      User.create(u, function(err, newUser) {
        User.create(u, function(err, newUser) {
          should.exist(err);
          err.name.should.equal('ValidationError');
          done();
        });
      });
    });

    it('user should have basic permissions', function(done) {
      User.create(u, function(err, newUser) {
        let basic = newUser.groups[0];
        should.exist(basic);
        done();
      });
    });

  });


  describe('#authenticate', function() {
    var user = {};

    beforeEach(function(done) {
      User.create(u, function(err, newUser) {
        user = newUser;
        done();
      });
    });


    it('should authenticate when provied a correct password', function(done) {
      user.authenticate(u.password).then(function(result) {
        result.should.equal(true);
        done();
      });
    });


    it('should not authenticate when provied a wrong password', function(done) {
      user.authenticate("not a good one").then(function(result) {
        result.should.equal(false);
        done();
      });
    });
  });


});
