'use strict';

const R = require('ramda');
const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const User = mongoose.model('User');


function createboard(socket) {
  let auth = socket.decoded_token;

  socket.on('general:createboard', function(board) {
    User.findOne({_id: auth.id}, function (err, user) {
      Board.create(R.merge(board, {user: user}), function(err, board) {
        if(err) {
          socket.emit('general:createboard:error', err);
        } else {
          socket.server.to('general').emit('general:createboard', board);
        }
      });
    });
  });

}


module.exports = createboard;
