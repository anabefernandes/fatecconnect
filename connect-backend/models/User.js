const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
  ra: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/@fatec.sp.gov.br$/, "Use um email institucional @fatec.sp.gov.br"],
  },
  senha: { type: String, required: true },
  papel: {
    type: String,
    enum: ["admin", "monitor", "aluno"],
    default: "aluno",
  },
  fotoPerfil: { type: String, default: "/uploads/usuario_padrao.png" },
  biografia: { type: String, default: "Escreva sobre você!!" },
});

module.exports = mongoose.model("User", UserSchema);
