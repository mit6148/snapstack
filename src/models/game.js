// import node modules
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

// define a schema
const GameSchema = new mongoose.Schema ({
  creator_id	: ObjectId,
  players		: [ObjectId],
  gpcards		: [ObjectId], // play cards, with more info about who played it
  jcard_id		: ObjectId, // current judge card
  jdeck			: ObjectId,
  pdeck			: ObjectId,
  j_wildcards	: Number,
  p_wildcards	: Number,
  p_discard		: ObjectId,
  p_discard_wild: Number, // # of discarded wild cards
  cards_to_win	: Number,
  timeout 		: Number,
  time_started	: Number,
  game_state	: Number, 
  
  /* waiting = 0, 
  pre-play = 1, 
  play = 2, 
  look = 3, 
  judge = 4, 
  game over = 5*/

});

// compile model from schema
module.exports = mongoose.model('Game', GameSchema);
