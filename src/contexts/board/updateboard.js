'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');

function updateboard(socket, boardId) {
  let room = `context:${boardId}`;

  socket.on(`${room}:updateboard`, function(updates) {
    Board.findOne({_id: boardId})
    .then(function(board) {
      //TODO validate updates, we do not want people overriding important fields.
      Object.keys(updates).forEach(k => {
        board[k] = updates[k];
      });
      return board.save().then(function() {return board; });
    })
    .then(function(board) {
      socket.server.to(room).emit(`${room}:updateboard`, board);
    })
    .catch(function(err) {
      socket.emit(`${room}:updateboard:error`, err);
    });
  });
}


module.exports = updateboard;
