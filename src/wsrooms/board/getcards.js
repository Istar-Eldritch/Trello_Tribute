'use strict';

const mongoose = require('mongoose');
const R = require('ramda');

const Card = mongoose.model('Card');


function getcards(socket, board) {
  let room = `context:${board.id}`;

  socket.on(`${room}:getcards`, function(filters) {
    Card.find(R.merge(filters, {boardId: board.id}))
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
