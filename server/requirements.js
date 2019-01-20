// for shared requirements
const http = require('http');
const express = require('express');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

module.exports = {http, express, app, server, io};