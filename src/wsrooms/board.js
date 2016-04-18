'use strict';

const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const deepRead = require('../common/deepRead');
const R = require('ramda');

function readWS(file) {
  return require(file);
}


const wsFunctions = deepRead(readWS, `${__dirname}/board/`);

function board(socket) {

  socket.on('board:watch', function(id) {
    // TODO add ACL policies here
    Board.findOne({_id: id}, function (err, board) {
      let room = `board:${id}`;

      if(board) {
        socket.join(room);
        wsFunctions.forEach((fn) => {
          fn(socket, board);
        });
        
        let sockets = R.values(socket.server.nsps['/'].adapter.rooms[room]);
        let clients = sockets.map((elem, index, coll) => {
          return elem.decoded_token;
        });
        socket.server.to(room).emit(`${room}:watch`, {list: clients, new: socket.decoded_token});

      } else {
        socket.emit(`${room}:watch:error`, {msg: 'Board does not exist'});
      }
    });

  });

  socket.on('board:unwatch', function(id) {
    socket.leave(`board:${id}`);
  });
}

module.exports = board;
