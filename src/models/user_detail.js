// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define a schema
const UserDetailSchema = new mongoose.Schema ({
    friends_list    : [ObjectId],
    invites         : [ObjectId],
    jdeck           : ObjectId,
    pdeck           : ObjectId,
    blocked         : [ObjectId],
    current_game    : ObjectId,
    games_played    : Number,
    games_won       : Number,
    jcards_played   : Number,
    jcards_won      : Number,
});

// compile model from schema
module.exports = mongoose.model('UserDetail', UserDetailSchema);