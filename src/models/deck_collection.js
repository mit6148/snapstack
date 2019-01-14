// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const DeckCollectionSchema = new mongoose.Schema ({
    decks       : [ObjectId],
});

// compile model from schema
module.exports = mongoose.model('DeckCollection', DeckCollectionSchema);