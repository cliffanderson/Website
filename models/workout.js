var mongoose = require('mongoose');

var workoutSchema = new mongoose.Schema({
   
    name: String,
    sets: Number,
    reps: Number,
    weight: Number
});

// create and expose model
module.exports = mongoose.model('Workout', workoutSchema);