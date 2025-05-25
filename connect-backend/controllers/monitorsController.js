const User = require("../models/User");
const HorarioDisponivel = require("../models/HorarioDisponivel");

// Listar todos os monitores (sem a senha)
const listMonitors = async (req, res) => {
  try {
    const monitores = await User.find({ papel: "monitor" }, { senha: 0 });
    return res.status(200).json({ success: true, monitores });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erro ao buscar monitores" });
  }
};

// Listar horários disponíveis de um monitor
const getMonitorSchedules = async (req, res) => {
  try {
    const horarios = await HorarioDisponivel.find({ monitor: req.params.monitorId });
    return res.status(200).json({ success: true, horarios });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erro ao buscar horários" });
  }
};

module.exports = {
  listMonitors,
  getMonitorSchedules,
};
