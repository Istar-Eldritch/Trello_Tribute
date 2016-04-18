const createboard = require('./general/createboard');
const getboards = require('./general/getboards');

function general(socket) {
  socket.join('general');
  createboard(socket);
  getboards(socket);

  return function leave() {
    socket.leave('general');
  };
}

module.exports = general;
