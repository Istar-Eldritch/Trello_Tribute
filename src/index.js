"use strict";

const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const socketiojwt = require('socketio-jwt');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const MODE = process.env.NODE_ENV;
const PORT = config.get('port');
const SECRET = config.get('jwt_secret');


// Boostrap the models
require('./models/user');
require('./models/board');
require('./models/card');
require('./models/action');

app.use(bodyParser.json());

server.listen(PORT, function() {
  console.log(`Server listening on port ${PORT}, mode ${MODE}`);
});
