const express = require("express");
const User = require("../models/User");
const HorarioDisponivel = require("../models/HorarioDisponivel");
const router = express.Router();

// deixando publico a rota de mostrat monitores
router.get("/monitores", async (req, res) => {
  try {
    const monitores = await User.find({ papel: "monitor" }, { senha: 0 });
    return res.status(200).json({ success: true, monitores });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erro ao buscar monitores" });
  }
});

//listar horarios disp p um monitor
router.get("/monitores/:monitorId/horarios", async (req, res) => {
  try {
    const horarios = await HorarioDisponivel.find({ monitor: req.params.monitorId });
    return res.status(200).json({ success: true, horarios });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erro ao buscar horários" });
  }
});

module.exports = router;