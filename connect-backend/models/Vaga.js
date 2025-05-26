const mongoose = require('mongoose');

const VagaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao:{ type: String, required: true },
  curso: { type: String, required: true },
  imagem: { type: String },
  dataCriacao: { type: Date, default: Date.now},
});
module.exports = mongoose.model('Vaga', VagaSchema);

