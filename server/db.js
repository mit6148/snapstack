const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// set up mongoDB connection
// Example URI ---> mongodb+srv://weblab:6jYctMizX5Y5ie6W@catbook-fsjig.mongodb.net/catbookdb?retryWrites=true
const mongoURL = ("mongodb+srv://snapstack-server:" + process.env.DB_SECRET
                  + "@cluster0-guxp5.gcp.mongodb.net/snapstack?retryWrites=true");
const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect(mongoURL, options);
mongoose.Promise = global.Promise;
const db = mongoose.connection;

// db error handling
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
