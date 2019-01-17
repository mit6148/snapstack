// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32')

// define a schema
const UserDetailSchema = new mongoose.Schema ({
    saved_pairs     : [{jcard: ObjectId, pcard: ObjectId}]
});

// compile model from schema
module.exports = mongoose.model('UserDetail', UserDetailSchema);