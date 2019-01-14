// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const DeckSchema = new mongoose.Schema ({
  name 		: String,
  cards		: [ObjectId],
  creator_id: ObjectId,

});

// compile model from schema
module.exports = mongoose.model('Deck', DeckSchema);
