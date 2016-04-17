'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');

function updateboard(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:updateboard`, function(updates) {
    //TODO validate updates, we do not want people overriding important fields.
    Object.keys(updates).forEach(k => {
      board[k] = updates[k];
    });
    board.save(function(err) {
      if(err) {
        socket.emit(`${room}:updateboard:error`, err);
      } else {
        socket.server.to(room).emit(`${room}:updateboard`, board);
      }
    });
  });
}


module.exports = updateboard;
