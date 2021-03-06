'use strict';

const mongoose = require('mongoose');
const Action = mongoose.model('Action');
const R = require('ramda');

function createaction(socket, boardId) {
  let room = `context:${boardId}`;

  socket.on(`${room}:createaction`, function(action) {
    let finalAction = R.merge(action, {
      creatorId: socket.decoded_token.id,
    });

    Action.create(finalAction)
    .then(function(newAction) {
        socket.server.to(room).emit(`${room}:createaction`, newAction);
    })
    .catch(function(err) {
      socket.emit(`${room}:createaction:error`, err);
    });
  });
}

module.exports = createaction;
