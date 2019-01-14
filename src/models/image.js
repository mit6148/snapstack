// import node modules
const mongoose = require('mongoose');

// define a schema
const ImageSchema = new mongoose.Schema ({
  image 		: Buffer,
});

// compile model from schema
module.exports = mongoose.model('Image', ImageSchema);
