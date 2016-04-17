

var server;

before(function(done) {
  server = require('../src/index');
  server.on('listening', function(){
    done();
  });
});


after(function(done) {
  server.close();
  server.on('close', function() {
    done();
  });
});
