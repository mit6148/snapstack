// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32');

// define a schema
const JCardSchema = new mongoose.Schema ({
  text              : String,
});

// compile model from schema
module.exports = mongoose.model('JCard', JCardSchema);
