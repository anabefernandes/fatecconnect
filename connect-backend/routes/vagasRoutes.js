const express = require("express");
const router = express.Router();
const Vaga = require("../models/Vaga");

const posts = [];
const multer = require("multer");
const path = require("path"); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'));
  }
};

const upload = multer({ storage, fileFilter });

router.post('/cadastrovagas', upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, descricao, curso } = req.body;
    const imagem = req.file ? req.file.filename : null;

    if (!titulo || !descricao || !curso || !imagem) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos e envie uma imagem.' });
    }

    const novaVaga = new Vaga({ titulo, descricao, curso, imagem });
    await novaVaga.save();

    res.status(201).json({ mensagem: 'Vaga cadastrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar vaga.', erro: error.message });
  }
}); 

// ROTA PARA LISTAR VAGAS
router.get('/vagas', async (req, res) => {
  try {
    const { curso } = req.query;

    const filtro = curso ? { curso: new RegExp(curso, 'i') } : {};
    const vagas = await Vaga.find(filtro).sort({ dataCriacao: -1 });

    res.status(200).json(vagas);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar vagas.', erro: error.message });
  }
}); 

module.exports = router;
