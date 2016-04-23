'use strict';

const mongoose = require('mongoose');
const Card = mongoose.model('Card');

function getcards(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:getcards`, function(filters) {
    Card.find(filters || {})
    .then(function(cards) {
      return Promise.all(cards.map(Card.populateActions));
    })
    .then(function(cards) {
      socket.emit(`${room}:getcards`, cards);
    })
    .catch(function(err) {
      socket.emit(`${room}:getcards:error`, err);
    });
  });
}

module.exports = getcards;
