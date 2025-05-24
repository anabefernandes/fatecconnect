const express = require("express");
const Agendamento = require("../models/Agendamento");
const HorarioDisponivel = require("../models/HorarioDisponivel");
const verificarToken = require("../middleware/verificarToken");
const agendamentoController = require("../controller/agendamentoController");
const router = express.Router();

// agendar monitoria
router.post("/agendamentos", verificarToken, async (req, res) => {
  try {
    const { monitorId, dataHora } = req.body;
    const [data, hora] = dataHora.split("T");

    // verifica se horarios disponivel
    const horarioDisponivel = await HorarioDisponivel.findOne({
      monitor: monitorId,
      data,
      hora,
    });

    if (!horarioDisponivel) {
      return res.status(400).json({ success: false, mensagem: "Horário indisponível" });
    }

    // cria o agendamento
    const agendamento = new Agendamento({
      aluno: req.user.id,  // id do aluno (do token)
      monitor: monitorId,
      data,
      horario: hora
    });

    await agendamento.save();
    return res.status(201).json({ success: true, mensagem: "Agendamento realizado com sucesso" });

  } catch (err) {
    return res.status(500).json({ success: false, mensagem: "Erro no servidor" });
  }
});

module.exports = router;
