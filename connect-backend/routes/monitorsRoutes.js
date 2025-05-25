const express = require("express");
const router = express.Router();
const {
  listMonitors,
  getMonitorSchedules,
} = require("../controllers/monitorsController");

// Rota pública para listar todos os monitores
router.get("/", listMonitors);

// Rota pública para listar horários disponíveis de um monitor
router.get("/:monitorId/horarios", getMonitorSchedules);

module.exports = router;
