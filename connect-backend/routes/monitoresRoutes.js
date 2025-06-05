const express = require("express");
const User = require("../models/User");
const HorarioDisponivel = require("../models/HorarioDisponivel");
const Agendamento = require("../models/Agendamento");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.get("/monitores", async (req, res) => {
  try {
    const monitores = await User.find({ papel: "monitor" })
      .select("nome fotoPerfil curso _id")
      .populate("curso", "nome");
    res.json({ monitores });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar monitores" });
  }
});

router.get("/agendamentos/monitor", verificarToken, async (req, res) => {
  try {
    if (req.user.papel !== "monitor") {
      return res
        .status(403)
        .json({ erro: "Acesso permitido apenas para monitores." });
    }
    const agenda = await Agendamento.find({ monitor: req.user.id })
      .populate("aluno", "nome")
      .populate("monitor", "nome");

    return res.status(200).json({
      success: true,
      agenda,
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar agendamentos." });
  }
});

//listar horarios disp p um monitor
router.get("/monitores/:monitorId/horarios", async (req, res) => {
  try {
    const horarios = await HorarioDisponivel.find({
      monitor: req.params.monitorId,
    });
    return res.status(200).json({ success: true, horarios });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Erro ao buscar horários" });
  }
});

module.exports = router;
