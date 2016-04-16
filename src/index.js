"use strict";

const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const socketiojwt = require('socketio-jwt');
const mongoose = require('mongoose');

const app = express();
const server = require('http').Server(app);
const wrap = require('co-express');
const io = require('socket.io')(server);

const MODE = process.env.NODE_ENV;
const PORT = config.get('port');
const DB = config.get('db');
const SECRET = config.get('jwt_secret');


// Boostrap the models

let User = require('./models/user');
require('./models/board');
require('./models/card');
require('./models/action');

app.use(bodyParser.json());

server.listen(PORT, function() {
  mongoose.connect(DB, function(err) {
    console.log(`Server listening on port ${PORT}, mode ${MODE}`);
  });
});

app.post('/register', require('./rest/user/register'));
app.post('/login', require('./rest/user/login'));


io.use(socketiojwt.authorize({
  secret: SECRET,
  handshake: true
}));

io.on('connection', function(socket) {
  let auth = jwt.decode(socket.handshake.query.token, {complete: true}).payload;

});
