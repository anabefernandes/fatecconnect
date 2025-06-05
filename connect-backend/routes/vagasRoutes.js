const express = require("express");
const router = express.Router();
const Vaga = require("../models/Vaga");
const verificarToken = require("../middlewares/verificarToken");

const posts = [];
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem são permitidos"));
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/cadastrovagas",
  verificarToken,
  upload.single("imagem"),
  async (req, res) => {
    try {
      const { titulo, descricao, curso } = req.body;
      const imagem = req.file ? req.file.filename : null;
      const criador = req.user.id;

      if (!titulo || !descricao || !curso || !imagem) {
        return res
          .status(400)
          .json({ mensagem: "Preencha todos os campos e envie uma imagem." });
      }

      const novaVaga = new Vaga({ titulo, descricao, curso, imagem, criador });
      await novaVaga.save();

      res.status(201).json({ mensagem: "Vaga cadastrada com sucesso!" });
    } catch (error) {
      res
        .status(500)
        .json({ mensagem: "Erro ao cadastrar vaga.", erro: error.message });
    }
  }
);

router.delete("/vagas/:id", verificarToken, async (req, res) => {
  try {
    const vaga = await Vaga.findById(req.params.id);

    if (!vaga) {
      return res.status(404).json({ mensagem: "Vaga não encontrada." });
    }
    if (
      vaga.criador.toString() !== req.user.id &&
      req.user.papel !== "monitor"
    ) {
      return res
        .status(403)
        .json({ mensagem: "Você não tem permissão para excluir esta vaga." });
    }

    await Vaga.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensagem: "Vaga excluída com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao excluir vaga.", erro: error.message });
  }
});

// ROTA PARA LISTAR VAGAS
router.get("/vagas", async (req, res) => {
  try {
    const { curso } = req.query;
    const filtro = curso ? { curso: new RegExp(curso, "i") } : {};

    const vagas = await Vaga.find(filtro)
      .populate("criador", "nome _id")
      .sort({ dataCriacao: -1 });

    res.status(200).json(vagas);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao buscar vagas.", erro: error.message });
  }
});

router.get("/minhas-vagas", verificarToken, async (req, res) => {
  try {
    const vagas = await Vaga.find({ criador: req.user.id })
      .populate("criador", "nome email fotoPerfil")
      .sort({ createdAt: -1 })
      .lean();

    // Formatar datas e URLs de imagem se necessário
    const vagasFormatadas = vagas.map((vaga) => ({
      ...vaga,
      createdAt: vaga.createdAt.toISOString(),
      imagemUrl: vaga.imagem
        ? `${process.env.BASE_URL}/uploads/${vaga.imagem}`
        : null,
    }));

    res.status(200).json(vagasFormatadas);
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vagas",
      error: error.message,
    });
  }
});

module.exports = router;
