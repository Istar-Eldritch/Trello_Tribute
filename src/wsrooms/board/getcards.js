'use strict';

const mongoose = require('mongoose');
const Card = mongoose.model('Card');

function getcards(socket, board) {
  let room = `board:${board.id}`;
  socket.on(`${room}:getcards`, function(filters) {
    Card.find(filters || {}, function(err, cards) {
      if(err) {
        socket.emit(`${room}:getcards:error`, err);
      } else {
        socket.emit(`${room}:getcards`, cards);
      }
    });
  });
}

module.exports = getcards;
