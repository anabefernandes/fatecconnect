const mongoose = require("mongoose");

const VagaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  curso: { type: String, required: true },
  imagem: { type: String, required: true },
  criador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Vaga", VagaSchema);

