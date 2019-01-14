// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const PlayerSchema = new mongoose.Schema ({
    winning_jcards  : [ObjectId],
    winning_pcards  : [ObjectId],
    state           : Number, // 0=not played yet, 1=played, 2=judge
    hand            : [ObjectId],
    last_card_index : Number,
    time_last_active: Number,
    user_id         : ObjectId,
});

// compile model from schema
module.exports = mongoose.model('Player', PlayerSchema);