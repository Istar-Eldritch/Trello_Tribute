'use strict';

const mongoose = require('mongoose');
const Card = mongoose.model('Card');
const R = require('ramda');

function createcard(socket, boardId) {
  let room = `context:${boardId}`;

  socket.on(`${room}:createcard`, function(card) {
    let finalCard = R.merge(card, {
      boardId: boardId,
      creatorId: socket.decoded_token.id
    });

    Card.create(finalCard)
    .then(Card.populateActions)
    .then(function(newCard) {
      socket.server.to(room).emit(`${room}:createcard`, newCard);
    })
    .catch(function(err) {
      socket.emit(`${room}:createcard:error`, err);
    });
  });
}

module.exports = createcard;
