const express = require("express");
const router = express.Router();
const Forum = require("../models/Forum");
const User = require("../models/User");
const verificarToken = require("../middlewares/verificarToken");

//Postar Dúvidas
router.post("/postar", verificarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const autorId = req.user.id;

  if (!titulo || !conteudo) {
    return res
      .status(400)
      .json({ erro: "Título e conteúdo são obrigatórios." });
  }

  try {
    const novoPost = new Forum({
      titulo,
      conteudo,
      autor: autorId,
    });

    const postSalvo = await novoPost.save();

    res.status(201).json({
      mensagem: "Post criado com sucesso!",
      dados: postSalvo,
    });
  } catch (err) {
    console.error("Erro ao criar post:", err);
    res.status(500).json({ mensagem: "Erro ao criar o post." });
  }
});

//Listar Posts
router.get("/posts", async (req, res) => {
  try {
    const { titulo } = req.query;
    const filtro = {};

    if (titulo) {
      filtro.titulo = new RegExp(titulo, "i");
    }

    const posts = await Forum.find(filtro)
      .populate("autor", "nome")
      .populate("respostas.autor", "nome")
      .sort({ dataCriacao: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Erro ao buscar posts:", err);
    res.status(500).json({ mensagem: "Erro ao buscar posts." });
  }
});

//Responder Posts
router.post("/posts/:id/responder", verificarToken, async (req, res) => {
  const { conteudo } = req.body;
  const autorId = req.user.id;
  const postId = req.params.id;

  if (!conteudo) {
    return res
      .status(400)
      .json({ erro: "O conteúdo da resposta é obrigatório." });
  }

  try {
    const post = await Forum.findById(postId);
    if (!post) {
      return res.status(404).json({ erro: "Post não encontrado." });
    }

    const resposta = {
      autor: autorId,
      conteudo,
    };

    post.respostas.push(resposta);
    await post.save();

    res
      .status(201)
      .json({ mensagem: "Resposta adicionada com sucesso!", post });
  } catch (err) {
    console.error("Erro ao responder post:", err);
    res.status(500).json({ mensagem: "Erro ao responder o post." });
  }
});

router.get("/meus-posts", verificarToken, async (req, res) => {
  try {
    const meusPosts = await Forum.find({ autor: req.user.id })
      .populate("autor", "nome")
      .sort({ dataCriacao: -1 });

    res.json(meusPosts);
  } catch (error) {
    console.error("Erro ao buscar seus posts:", error);
    res.status(500).json({ error: "Erro ao buscar seus posts" });
  }
});
module.exports = router;