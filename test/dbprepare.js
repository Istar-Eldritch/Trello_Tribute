'use strict';

const mongoose = require('mongoose');
const config = require('config');

beforeEach(function(done) {

  function cleanDB(done) {
    for(var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove();
    }
    // mongoose.connection.collections.forEach(collection => {
    //   collection.remove();
    // });
    return done();
  }

  if(mongoose.connection.readyState === 0) {
    mongoose.connect(config.get('db'), function(err) {
      if(err) {
        throw err;
      }
      return cleanDB(done);
    });
  } else {
    return cleanDB(done);
  }
});

afterEach(function(done) {
  mongoose.disconnect();
  return done();
});
