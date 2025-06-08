const express = require("express");
const User = require("../models/User");
const HorarioDisponivel = require("../models/HorarioDisponivel");
const Agendamento = require("../models/Agendamento");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

//listar monitores
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

//listar agendamentos monitor logado
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
const diasOrdem = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

router.get("/monitores/:monitorId/horarios", async (req, res) => {
  try {
    const horarios = await HorarioDisponivel.find({
      monitor: req.params.monitorId,
    });

    // Ordena dias e horários
    horarios.sort((a, b) => {
      const diffDia = diasOrdem[a.diaSemana] - diasOrdem[b.diaSemana];
      if (diffDia !== 0) return diffDia;
      return a.horaInicio.localeCompare(b.horaInicio);
    });

    return res.status(200).json({ success: true, horarios });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Erro ao buscar horários" });
  }
});

// cadastra ou atualiza seus hrs disponiveis
router.post("/horarios-disponiveis", verificarToken, async (req, res) => {
  try {
    if (req.user.papel !== "monitor") {
      return res
        .status(403)
        .json({ error: "Apenas monitores podem definir horários." });
    }

    const { horarios } = req.body; // Ex: [{ diaSemana: "segunda", horaInicio: "08:00", horaFim: "12:00" }, ...]

    if (!Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({ error: "Horários inválidos ou vazios." });
    }

    // remove horários antigos p atualizar
    await HorarioDisponivel.deleteMany({ monitor: req.user.id });

    // insere novos
    const novos = horarios.map((h) => ({
      diaSemana: h.diaSemana.toLowerCase(), // padronizar
      horaInicio: h.horaInicio,
      horaFim: h.horaFim,
      monitor: req.user.id,
    }));

    await HorarioDisponivel.insertMany(novos);

    res.status(200).json({ message: "Horários atualizados com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar horários" });
  }
});

module.exports = router;
