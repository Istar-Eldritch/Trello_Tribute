'use strict';

const mongoose = require('mongoose');
const Card = mongoose.model('Card');

function getcards(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:getcards`, function(filters) {
    Card.find(filters || {}).populate('actions')
    .then(function(card) {
      socket.emit(`${room}:getcards`, card);
    })
    .catch(function(err) {
      socket.emit(`${room}:getcards:error`, err);
    });
  });
}

module.exports = getcards;
