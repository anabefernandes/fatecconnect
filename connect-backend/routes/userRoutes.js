const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verificarToken = require("../middlewares/verificarToken");
const verificarAdmin = require("../middlewares/verificarAdmin");

// Listar todos os usuários (apenas admin)
router.get("/", verificarToken, verificarAdmin, userController.listarUsuarios);

// Obter um único usuário (admin ou usuário autenticado)
router.get("/:id", verificarToken, userController.obterUsuario);

// Atualizar usuário (admin)
router.put("/:id", verificarToken, verificarAdmin, userController.atualizarUsuario);

// Excluir usuário (admin)
router.delete("/:id", verificarToken, verificarAdmin, userController.excluirUsuario);

// Listar cursos (disponível para todos usuários autenticados)
router.get("/cursos/listar", verificarToken, userController.listarCursos);

module.exports = router;
