const mongoose = require("mongoose");

const HorarioDisponivelSchema = new mongoose.Schema({
  monitor: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  data: {type: String, required: true},
  hora: {type: String, required: true}
});

module.exports = mongoose.model("HorarioDisponivel", HorarioDisponivelSchema);
