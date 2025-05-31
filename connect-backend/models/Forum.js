const mongoose = require('mongoose');

const respostaSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conteudo: { type: String, required: true },
  data: { type: Date, default: Date.now }
});

const ForumSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  autor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  dataCriacao: { type: Date, default: Date.now },
  respostas: [respostaSchema]
}); 

module.exports = mongoose.model('Forum', ForumSchema);