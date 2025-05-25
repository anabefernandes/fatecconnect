const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const uploadController = require("../controllers/uploadController");
const verificarToken = require("../middlewares/verificarToken");

// Upload de imagem de perfil (usuário autenticado)
router.post("/foto-perfil", verificarToken, upload.single("fotoPerfil"), uploadController.uploadFoto);

module.exports = router;
