const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Date, required: true },
  status: {
  type: String,
  enum: ["pendente", "cancelado", "concluído"],  
  default: "pendente"
}
});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
