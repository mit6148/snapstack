// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32');

// define a schema
const CardSchema = new mongoose.Schema ({
  text				: String,
  text_creator_id	: ObjectId,
  image_id			: ObjectId,
  image_creator_id	: ObjectId,
  ref_count			: Int32,
});

// compile model from schema
module.exports = mongoose.model('Card', CardSchema);
