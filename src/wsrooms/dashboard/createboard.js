'use strict';

const R = require('ramda');
const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const User = mongoose.model('User');

function createboard(socket, contextId) {
  let auth = socket.decoded_token;
  let room = `context:${contextId}`;

  socket.on(`${room}:createboard`, function(board) {
    Board.create(R.merge(board, {ownerId: contextId, creatorId: auth.id}))
    .then(function(board) {
        socket.server.to(`${room}`).emit(`${room}:createboard`, board);
    })
    .catch(function(err){
      socket.emit(`${room}:createboard:error`, err);
    });
  });

}


module.exports = createboard;
