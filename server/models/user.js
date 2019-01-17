// import node modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

// define a schema
const UserSchema = new mongoose.Schema ({
  name          : String,
  googleid      : String,
  avatar        : Buffer,
  description   : String,
  email         : String,
  details_id    : ObjectId,
  current_game  : ObjectId,
  media         : Map,
});

// compile model from schema
module.exports = mongoose.model('User', UserSchema);
