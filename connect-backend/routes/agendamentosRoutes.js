const express = require("express");
const Agendamento = require("../models/Agendamento");
const verificarToken = require("../middlewares/verificarToken");
const mongoose = require("mongoose");
const router = express.Router();

//agendar monitoria
router.post("/agendar-monitoria", async (req, res) => {
  try {
    const { alunoId, monitorId, data } = req.body;

    if (!alunoId || !monitorId || !data) {
      return res
        .status(400)
        .json({ mensagem: "Dados incompletos para agendamento" });
    }

    // Verifica se IDs são válidos
    if (
      !mongoose.Types.ObjectId.isValid(alunoId) ||
      !mongoose.Types.ObjectId.isValid(monitorId)
    ) {
      return res.status(400).json({ mensagem: "IDs inválidos" });
    }

    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return res.status(400).json({ mensagem: "Data inválida" });
    }

    // Verifica conflito
    const conflito = await Agendamento.findOne({
      monitor: monitorId,
      data: dataObj,
    });

    if (conflito) {
      return res
        .status(400)
        .json({ mensagem: "Horário indisponível para este monitor." });
    }

    const novoAgendamento = await Agendamento.create({
      aluno: alunoId,
      monitor: monitorId,
      data: dataObj,
      status: "pendente",
    });

    res
      .status(201)
      .json({
        mensagem: "Agendamento criado com sucesso",
        agendamento: novoAgendamento,
      });
  } catch (err) {
    console.error("Erro no agendamento:", err);
    res
      .status(500)
      .json({ mensagem: "Erro ao agendar monitoria", erro: err.message });
  }
});

router.patch("/agendamentos/:id/status", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const agendamento = await Agendamento.findById(id);
    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    agendamento.status = status;
    await agendamento.save();

    return res.status(200).json({ success: true, agendamento });
  } catch (err) {
    console.error("Erro ao atualizar status:", err); // <- aqui
    return res.status(500).json({ erro: "Erro ao atualizar status" });
  }
});

router.get("/agendamentos/aluno", verificarToken, async (req, res) => {
  try {
    if (req.user.papel !== "aluno") {
      return res
        .status(403)
        .json({ erro: "Acesso permitido apenas para alunos." });
    }

    const agenda = await Agendamento.find(
      { aluno: req.user.id },
      { senha: 0 }
    ).populate("monitor", "nome");

    return res.status(200).json({ success: true, agenda });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar agendamentos." });
  }
});

module.exports = router;
