'use strict';

const mongoose = require('mongoose');
const Card = mongoose.model('Card');
const R = require('ramda');

function createcard(socket, board) {
  let room = `board:${board.id}`;

  socket.on(`${room}:createcard`, function(card) {
    let finalCard = R.merge(card, {
      boardId: board.id,
      creatorId: socket.decoded_token.id
    });

    Card.create(finalCard, function(err, newCard) {
      if(err) {
        socket.emit(`${room}:createcard:error`, err);
      } else {
        socket.server.to(room).emit(`${room}:createcard`, newCard);
      }
    });
  });
}

module.exports = createcard;
