const express = require("express");
const router = express.Router();
const Forum = require("../models/Forum");
const User = require("../models/User");
const verificarToken = require("../middlewares/verificarToken");

//Postar Dúvidas
router.post("/postar", verificarToken, async (req, res) => {
  const { titulo} = req.body;
  const autorId = req.user.id;

  if (!titulo) {
    return res
      .status(400)
      .json({ erro: "Conteúdo é obrigatório." });
  }

  try {
    const novoPost = new Forum({
      titulo,
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

router.post("/posts/:id/curtir", verificarToken, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    const userId = req.user.id || req.user._id;

    if (!post) {
      return res.status(404).json({ mensagem: "Post não encontrado." });
    }

    const jaCurtiu = post.likes.includes(userId);

    if (jaCurtiu) {
      post.likes.pull(userId); // Descurtir
    } else {
      post.likes.push(userId); // Curtir
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (err) {
    console.error("Erro ao curtir:", err);
    res.status(500).json({ mensagem: "Erro ao curtir post." });
  }
});

router.put('/posts/:postId', verificarToken, async (req, res) => {
  const { postId } = req.params;
  const { titulo} = req.body;

  try {
    const post = await Forum.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Verifica se o usuário é o autor do post
    if (post.autor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Usuário não autorizado para editar este post' });
    }

    // Atualiza os campos (somente se enviados)
    if (titulo) post.titulo = titulo;

    await post.save();

    res.json({ message: 'Post atualizado com sucesso', post });
  } catch (err) {
    console.error('Erro ao editar post:', err);
    res.status(500).json({ message: 'Erro ao editar o post' });
  }
});

router.delete('/posts/:postId', verificarToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Forum.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (post.autor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Usuário não autorizado para excluir este post' });
    }

    await Forum.findByIdAndDelete(postId);

    res.json({ message: 'Post excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir post:', err);
    res.status(500).json({ message: 'Erro ao excluir o post' });
  }
});



module.exports = router;