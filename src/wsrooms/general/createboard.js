'use strict';

const R = require('ramda');
const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const User = mongoose.model('User');


function createboard(socket) {
  let auth = socket.decoded_token;

  socket.on('general:createboard', function(board) {
    Board.create(R.merge(board, {creatorId: auth.id}))
    .then(function(board) {
        socket.server.to('general').emit('general:createboard', board);
    })
    .catch(function(err){
      socket.emit('general:createboard:error', err);
    });
  });

}


module.exports = createboard;
