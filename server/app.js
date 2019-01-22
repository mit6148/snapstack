require('dotenv').config(); // keep this as first line

const fs = require('fs');

console.log(fs.readFileSync(process.env.TEST_ENVIRONMENT_VARIABLE));


const {http, express, app, server, io} = require('./requirements');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');

// local dependencies
const db = require('./db');
const passport = require('./passport');
const passportSocketIo = require('passport.socketio');
const api = require('./api');
const {onConnection} = require('./gameLogic');
const publicPath = path.resolve(__dirname, '..', 'client', 'dist');

// set POST request body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// TODO: storage cleanup operations: delete unreferenced pcards and their images



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
app.use('/', express.static(publicPath));

function sendIndexHTML(req, res) {
  res.sendFile(path.join(publicPath, 'index.html'));
}

app.get('/profile/:id', sendIndexHTML);
app.get('/about', sendIndexHTML);

// 404 route
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// route error handler
app.use(function(err, req, res, next) {
  console.log("failed getting: " + req.url + ": " + err);
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = process.env.PORT || 3000; // config variable
server.listen(port, function() {
  console.log('Server running on port: ' + port);
});



io.use(passportSocketIo.authorize({
  key: process.env.SESS_KEY,
  secret: process.env.SESS_SECRET,
  store: sessionStore
}));

io.on('connect', socket => onConnection(socket));
