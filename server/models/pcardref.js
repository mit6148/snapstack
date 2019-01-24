// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32');

// define a schema
const PCardRefSchema = new mongoose.Schema ({
  text				: String,
  image_ref			: String,
  creator_id        : ObjectId,
  ref_count			: Int32,
  server            : String, // name of server, or empty string if not in play
});

// compile model from schema
module.exports = mongoose.model('PCardRef', PCardRefSchema);
