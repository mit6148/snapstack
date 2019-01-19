// libraries
require('dotenv').config();
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');

// initialize express app
const app = express();
const server = http.Server(app);


const io = require('socket.io')(server);
const onConnection = require('./gameLogic');

// local dependencies
const db = require('./db');
const passport = require('./passport');
const passportSocketIo = require('passport.socketio');
const api = require('./api');
const publicPath = path.resolve(__dirname, 'test');

// set POST request body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// set up sessions
const sessionStore = new MongoStore({'mongooseConnection': db});
app.use(session({
  key: process.env.SESS_KEY,
  secret: process.env.SESS_SECRET,
  resave: 'false',
  saveUninitialized: 'true',
  store: sessionStore
}));

// hook up passport
app.use(passport.initialize());
app.use(passport.session());

// authentication routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get(
  '/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    { failureRedirect: '/login' }
  ),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// set routes
app.use('/api', api );
app.use(express.static(publicPath));


// 404 route
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// route error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = 3000; // config variable
server.listen(port, function() {
  console.log('Server running on port: ' + port);
});



io.on('connect', socket => onConnection(socket, io));
