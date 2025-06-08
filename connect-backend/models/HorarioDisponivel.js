const mongoose = require("mongoose");

const HorarioDisponivelSchema = new mongoose.Schema({
  monitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  diaSemana: {
    type: String,
    enum: [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ],
    required: true,
  },
  horaInicio: { type: String, required: true }, // formato 08:00
  horaFim: { type: String, required: true }, // formato 12:00
});

module.exports = mongoose.model("HorarioDisponivel", HorarioDisponivelSchema);
