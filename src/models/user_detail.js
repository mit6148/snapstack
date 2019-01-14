// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32')

// define a schema
const UserDetailSchema = new mongoose.Schema ({
    friends_list    : [ObjectId],
    invites         : [ObjectId],
    jdeck           : ObjectId,
    pdeck           : ObjectId,
    blocked         : [ObjectId],
    current_game    : ObjectId,
    games_played    : Int32,
    games_won       : Int32,
    jcards_played   : Int32,
    jcards_won      : Int32,
});

// compile model from schema
module.exports = mongoose.model('UserDetail', UserDetailSchema);