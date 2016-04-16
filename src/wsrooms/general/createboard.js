const R = require('ramda');
const mongoose = require('mongoose');
const Board = mongoose.model('Board');


function createboard(socket) {
  let auth = jwt.decode(socket.handshake.query.token, {complete: true}).payload;

  socket.on('general:createboard', function(board) {
    Board.create(R.merge(board, {owner: auth}), function(err, result) {
      if(err) {
        socket.emit('general:createboard:error', err);
      } else {
        socket.to('general').emit('general:createboard', result);
      }
    });
  });
}


module.exports = createboard;
