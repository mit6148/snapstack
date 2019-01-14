// import node modules
const mongoose = require('mongoose');

// define a schema
const UserSchema = new mongoose.Schema ({
  name          : String,
  googleid      : String,
  username      : String,
  avatar        : Buffer,
  description   : String,
  email         : String,
  profile_id    : mongoose.Schema.Types.ObjectId,
});

// compile model from schema
module.exports = mongoose.model('User', UserSchema);
