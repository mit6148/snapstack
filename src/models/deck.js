// import node modules
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectID;

// define a schema
const DeckSchema = new mongoose.Schema ({
  name 		: String,
  cards		: [ObjectID],
  creator_id: ObjectID,
  
});

// compile model from schema
module.exports = mongoose.model('Deck', DeckSchema);
