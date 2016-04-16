'use strict';

require('../dbprepare');
const chai = require('chai');
const should = chai.should();
const User = require('../../src/models/user');

describe('User: model', function() {
  describe('#create()', function() {

    let u = {
      name: 'Ruben Paz',
      email: 'me@ruben.io',
      password: 'testing',
    };

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

  });
});
