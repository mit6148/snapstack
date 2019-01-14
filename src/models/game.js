// import node modules
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
const Int32 = require('mongoose-int32');

// define a schema
const GameSchema = new mongoose.Schema ({
  creator_id	: ObjectId,
  players		: [ObjectId],
  gpcards		: [ObjectId], // play cards, with more info about who played it
  jcard_id		: ObjectId, // current judge card
  jdeck			: ObjectId,
  pdeck			: ObjectId,
  j_wildcards	: Int32,
  p_wildcards	: Int32,
  p_discard		: ObjectId,
  p_discard_wild: Int32, // # of discarded wild cards
  cards_to_win	: Int32,
  timeout 		: Int32,
  time_started	: Date,
  game_state	: Int32, // waiting = 0, pre-play = 1, play = 2, look = 3, judge = 4, game over = 5

});

// compile model from schema
module.exports = mongoose.model('Game', GameSchema);
