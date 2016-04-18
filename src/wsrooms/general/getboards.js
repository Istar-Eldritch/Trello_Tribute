'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');

function getboards(socket) {
  // TODO implement some sort of ACL here

  socket.on('general:getboards', function() {
    Board.find({}, function(err, boards) {
      socket.emit('general:getboards', boards);
    });
  });
}

module.exports = getboards;
