const mongoose = require("mongoose");

const AgendamentoSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  data: { type: String, required: true },
  horario: { type: String, required: true }
});

module.exports = mongoose.model("Agendamento", AgendamentoSchema);
