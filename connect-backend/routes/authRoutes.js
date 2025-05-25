const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login
router.post("/login", authController.login);

// Cadastro de aluno
router.post("/cadastro", authController.cadastroAluno);

// Cadastro de monitor (somente admin deve usar essa rota)
router.post("/criar-monitor", authController.criarMonitor);

// Redefinição de senha
router.post("/solicitar-redefinicao", authController.solicitarRedefinicao);
router.post("/redefinir-senha", authController.redefinirSenha);

module.exports = router;
