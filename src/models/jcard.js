// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const JCardSchema = new mongoose.Schema ({
  text				: String,
  text_creator_id	: ObjectId,
  ref_count			: Number,
});

// compile model from schema
module.exports = mongoose.model('JCard', JCardSchema);
