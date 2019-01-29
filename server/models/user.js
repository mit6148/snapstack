// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

// define a schema
const UserSchema = new mongoose.Schema ({
    facebookId   : {type: String, index: {unique: true}},
    detail_id    : ObjectId,
    is_new       : Boolean,
});

// compile model from schema
module.exports = mongoose.model('User', UserSchema);
