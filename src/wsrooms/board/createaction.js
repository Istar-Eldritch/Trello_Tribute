'use strict';

const mongoose = require('mongoose');
const Action = mongoose.model('Action');
const R = require('ramda');

function createaction(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:createaction`, function(action) {
    let finalAction = R.merge(action, {
      boardId: board.id,
      creatorId: socket.decoded_token.id,
    });

    Action.create(finalAction, function(err, newAction) {
      if(err) {
        socket.emit(`${room}:createaction:error`, err);
      } else {
        socket.server.to(room).emit(`${room}:createaction`, newAction);
      }
    });
  });
}

module.exports = createaction;
