const mongoose = require("mongoose");

const CursoSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Curso", CursoSchema);
