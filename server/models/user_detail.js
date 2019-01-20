// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32')

// define a schema
const UserDetailSchema = new mongoose.Schema ({
    name            : String,
    saved_pairs     : [{jcard: ObjectId, pcard: ObjectId}],
    avatar          : String, // format: "data:[content-type];base64,[base64 encoded image]"
    description     : String,
    email           : String,
    media           : Map,
});

// compile model from schema
module.exports = mongoose.model('UserDetail', UserDetailSchema);