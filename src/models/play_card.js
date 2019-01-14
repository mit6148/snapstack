// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const PlayCardSchema = new mongoose.Schema ({
  card_id			: ObjectId,
  owner_id			: ObjectId,
  faceup			: Boolean,
});

// compile model from schema
module.exports = mongoose.model('PlayCard', PlayCardSchema);
