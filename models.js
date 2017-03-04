var mongoose = require('mongoose');

var riderSchema = mongoose.Schema({
  first_name: String,
  type: String, //pickup or dropoff. when it is "dropoff" the game button shows up on the screen
  rider_id: String,
  me: Boolean //if im the primaryrider
});


var gameroomSchema = mongoose.Schema({
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Rider'}],
  score: Number,
  inProgress: Boolean //if game is continuing.
});



var Rider = mongoose.model('Rider', riderSchema);
var Gameroom = mongoose.model('Gameroom', gameroomSchema);


module.exports = {
  Rider: Rider,
  Gameroom: Gameroom

};
