const Agendamento = require("../models/Agendamento");

exports.criarAgendamento = async (req, res) => {
  try {
    const { monitorId, dataHora } = req.body;
    const alunoId = req.userId; 

    if (!monitorId || !dataHora) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const [data, horario] = dataHora.split("T");

    const novoAgendamento = new Agendamento({
      aluno: alunoId,
      monitor: monitorId,
      data,
      horario
    });

    await novoAgendamento.save();

    return res.status(201).json({ mensagem: "Agendamento realizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ error: "Erro interno ao criar agendamento." });
  }
};
