

var server;

before(function(done) {
  server = require('../src/index');
  server.on('listening', function(){
    done();
  });
});


after(function() {
  server.close();
});
