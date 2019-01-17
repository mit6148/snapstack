// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32');

// define a schema
const PlayerSchema = new mongoose.Schema ({
    winning_jcards  : [ObjectId],
    winning_pcards  : [ObjectId],
    state           : Int32, // 0=not played yet, 1=played, 2=judge
    hand            : [ObjectId],
    last_card_index : Int32,
    time_last_active: Date,
    user_id         : ObjectId,
});

// compile model from schema
module.exports = mongoose.model('Player', PlayerSchema);