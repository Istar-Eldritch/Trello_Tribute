'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');

function update(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:update`, function(updates) {
    //TODO validate updates, we do not want people overriding important fields.
    Object.keys(updates).forEach(k => {
      board[k] = updates[k];
    });
    board.save(function(err) {
      if(err) {
        socket.emit(`${room}:update:error`, err);
      } else {
        socket.server.to(room).emit(`${room}:update`, board);
      }
    });
  });
}


module.exports = update;
