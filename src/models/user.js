// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

// define a schema
const UserSchema = new mongoose.Schema ({
  name          : String,
  googleid      : String,
  username      : String,
  avatar        : Buffer,
  description   : String,
  email         : String,
  profile_id    : ObjectId
});

// compile model from schema
module.exports = mongoose.model('User', UserSchema);
