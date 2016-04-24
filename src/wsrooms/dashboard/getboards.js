'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');

function getboards(socket, contextId) {
  // TODO implement some sort of ACL here

  let room = `context:${contextId}`;

  socket.on(`${room}:getboards`, function() {
    Board.find({})
    .then(function(boards) {
      socket.emit(`${room}:getboards`, boards);
    })
    .catch(function(err) {
      socket.emit(`${room}:getboards:error`, err);
    });
  });
}

module.exports = getboards;
