// for shared requirements
const http = require('http');
const express = require('express');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 4500,
    pingInterval: 1500
});

module.exports = {http, express, app, server, io};