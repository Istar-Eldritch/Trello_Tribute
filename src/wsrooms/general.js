const createboard = require('./general/createboard');

function general(socket) {
  socket.join('general');
  createboard(socket);

  return function leave() {
    socket.leave('general');
  };
}

module.exports = general;
