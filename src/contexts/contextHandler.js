'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Board = mongoose.model('Board');
const deepRead = require('../common/deepRead');
const R = require('ramda');

function readWS(file) {
  return require(file);
}


const wsBoardFunctions = deepRead(readWS, `${__dirname}/board/`);
const wsDashBoardFunctions = deepRead(readWS, `${__dirname}/dashboard/`);

// TODO Abstract this funciton
function context(socket) {

  socket.on('context:watch', function(contextType, id) {
    // TODO add ACL policies here
    let room = `context:${id}`;

    if(contextType === 'board') {
      Board.findOne({_id: id}, function (err, board) {


        if(board) {
          socket.join(room);
          wsBoardFunctions.forEach((fn) => {
            fn(socket, board.id);
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
    } else if(contextType === 'dashboard') {
      //TODO Organizations & Teams Here

      User.findOne({_id: id})
      .then(function (dashboard) {

        socket.join(room);
        wsDashBoardFunctions.forEach((fn) => {
          fn(socket, dashboard.id);
        });

        let sockets = R.values(socket.server.nsps['/'].adapter.rooms[room]);
        let clients = sockets.map((elem, index, coll) => {
          return elem.decoded_token;
        });
        socket.server.to(room).emit(`${room}:watch`, {list: clients, new: socket.decoded_token});
      })
      .catch(function(err) {
        socket.emit(`${room}:watch:error`, {msg: 'Board does not exist'});
      });
    }


  });

  socket.on('context:unwatch', function(contextType, id) {
    socket.leave(`context:${id}`);
  });
}

module.exports = context;
