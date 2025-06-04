const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Curso = require("../models/Curso");
const verificarToken = require("../middlewares/verificarToken");
const verificarAdmin = require("../middlewares/verificarAdmin");
const sendEmail = require("../mail");
let resetTokens = {};
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Agendamento = require("../models/Agendamento");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const handleError = (res, err, status = 500) => {
  console.error(err);
  return res.status(status).json({
    success: false,
    mensagem: status === 500 ? "Erro no servidor" : err.message,
  });
};

//upload de foto
router.post(
  "/upload-foto",
  verificarToken,
  upload.single("foto"),
  async (req, res) => {
    try {
      const filePath = `/uploads/${req.file.filename}`;
      const userId = req.user.id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fotoPerfil: filePath },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, mensagem: "Usuário não encontrado" });
      }

      res.status(200).json({
        success: true,
        mensagem: "Imagem salva no banco com sucesso!",
        path: filePath,
        usuario: {
          nome: updatedUser.nome,
          email: updatedUser.email,
          fotoPerfil: updatedUser.fotoPerfil,
        },
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, mensagem: "Erro ao enviar imagem." });
    }
  }
);

// cadastro de usuário comum (aluno)
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, papel, curso: cursoNome, ra } = req.body;

    if (!email.endsWith("@fatec.sp.gov.br")) {
      return res.status(400).json({
        success: false,
        mensagem: "Apenas emails @fatec.sp.gov.br são permitidos",
      });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        mensagem: "Email já cadastrado",
      });
    }

    if (await User.findOne({ ra })) {
      return res.status(400).json({
        success: false,
        mensagem: "RA já cadastrado",
      });
    }

    // Busca o curso pelo nome
    const curso = await Curso.findOne({ nome: cursoNome });
    if (!curso) {
      return res.status(400).json({
        success: false,
        mensagem: "Curso não encontrado",
      });
    }

    const novoUsuario = new User({
      nome,
      email,
      senha: await bcrypt.hash(senha, 10),
      papel: papel || "aluno",
      curso: curso._id,
      ra,
    });

    await novoUsuario.save();

    return res.status(201).json({
      success: true,
      mensagem: "Usuário cadastrado com sucesso",
      usuario: {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        papel: novoUsuario.papel,
        curso: novoUsuario.curso,
        ra: novoUsuario.ra,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// criar monitor (apenas admin)
router.post(
  "/criar-monitor",
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { nome, email, senha, ra, curso: cursoNome } = req.body;

      if (!email.endsWith("@fatec.sp.gov.br")) {
        return res.status(400).json({
          success: false,
          mensagem: "Apenas emails @fatec.sp.gov.br são permitidos",
        });
      }

      if (await User.findOne({ email })) {
        return res.status(400).json({
          success: false,
          mensagem: "Email já cadastrado",
        });
      }

      if (await User.findOne({ ra })) {
        return res.status(400).json({
          success: false,
          mensagem: "RA já cadastrado",
        });
      }

      // Busca o curso pelo nome
      const curso = await Curso.findOne({ nome: cursoNome });
      if (!curso) {
        return res.status(400).json({
          success: false,
          mensagem: "Curso não encontrado",
        });
      }

      const novoMonitor = new User({
        nome,
        email,
        senha: await bcrypt.hash(senha, 10),
        papel: "monitor",
        curso: curso._id,
        ra,
      });

      await novoMonitor.save();

      return res.status(201).json({
        success: true,
        mensagem: "Monitor criado com sucesso",
        usuario: {
          nome: novoMonitor.nome,
          email: novoMonitor.email,
          papel: novoMonitor.papel,
          curso: novoMonitor.curso,
          ra: novoMonitor.ra,
        },
      });
    } catch (err) {
      return handleError(res, err);
    }
  }
);

// rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        mensagem: "Email e senha são obrigatórios",
      });
    }

    const usuario = await User.findOne({ email })
      .select("+senha")
      .populate("curso", "nome");
    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensagem: "Credenciais inválidas",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        mensagem: "Credenciais inválidas",
      });
    }

    //token JWT
    const token = jwt.sign(
      { id: usuario._id, papel: usuario.papel, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const getDestino = (papel) => {
      const paineis = {
        admin: "/painel-admin",
        monitor: "/painel-monitor",
        aluno: "/painel-aluno",
      };
      return paineis[papel] || "/";
    };

    return res.json({
      success: true,
      token,
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        curso: usuario.curso.nome,
        ra: usuario.ra,
        fotoPerfil: usuario.fotoPerfil || "/uploads/usuario_padrao.png",
        biografia: usuario.biografia,
      },
      redirectTo: getDestino(usuario.papel),
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/solicitar-redefinicao", async (req, res) => {
  const { email } = req.body;
  const usuario = await User.findOne({ email });
  if (!usuario)
    return res.status(404).json({ mensagem: "Usuário não encontrado." });

  // Geração do token
  const token = Math.random().toString(36).substr(2, 8);

  // Salvar token de redefinição no objeto
  resetTokens[token] = email;

  // Enviar o e-mail com o token
  const link = `${token}`;
  const subject = "Redefinição de senha";
  const text = `Você solicitou a redefinição de senha. Clique no link para redefinir sua senha: ${link}`;

  try {
    await sendEmail(email, subject, text); // Envia o e-mail
    res.json({ mensagem: "Token enviado por e-mail." });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao enviar o e-mail." });
  }
});

router.post("/redefinir-senha", async (req, res) => {
  const { token, novaSenha } = req.body;

  // Verificar se o token é válido
  const email = resetTokens[token];
  if (!email) {
    return res.status(400).json({ mensagem: "Token inválido ou expirado." });
  }

  // Encontrar o usuário e atualizar a senha
  const usuario = await User.findOne({ email });
  if (!usuario) {
    return res.status(404).json({ mensagem: "Usuário não encontrado." });
  }

  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(novaSenha, salt);

  usuario.senha = senhaHash;
  await usuario.save();

  // Remover o token após a redefinição
  delete resetTokens[token];

  res.json({ mensagem: "Senha redefinida com sucesso!" });
});

//apenas ADMIN: listar, atualizar e excluir users
router.get("/usuarios", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const usuarios = await User.find({}, { senha: 0 }).populate("curso").lean();
    console.log(usuarios);
    return res.status(200).json({
      success: true,
      usuarios,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get(
  "/usuarios/:id",
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const usuario = await User.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          mensagem: "Usuário não encontrado",
        });
      }
      return res.status(200).json({
        success: true,
        usuario,
      });
    } catch (err) {
      return handleError(res, err);
    }
  }
);

router.put(
  "/usuarios/:id",
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, papel } = req.body;

      const usuario = await User.findByIdAndUpdate(
        id,
        { nome, email, papel },
        { new: true }
      );

      if (!usuario) {
        return res.status(404).json({
          success: false,
          mensagem: "Usuário não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        mensagem: "Usuário atualizado",
        usuario,
      });
    } catch (err) {
      return handleError(res, err);
    }
  }
);

router.delete(
  "/usuarios/:id",
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const usuario = await User.findByIdAndDelete(req.params.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          mensagem: "Usuário não encontrado",
        });
      }
      return res.status(200).json({
        success: true,
        mensagem: "Usuário excluído com sucesso",
      });
    } catch (err) {
      return handleError(res, err);
    }
  }
);

//retorna os cursos para o cadastro
router.get("/cursos", async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar cursos" });
  }
});

//retorna dados do perfil para o usuario
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select("-senha");
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, mensagem: "Usuário não encontrado." });
    }
    res.json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ success: false, mensagem: "Erro interno." });
  }
});

router.post("/biografia", verificarToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { biografia } = req.body;

    if (typeof biografia !== "string") {
      return res.status(400).json({
        success: false,
        mensagem: "Biografia precisa ser uma string",
      });
    }

    const usuarioAtualizado = await User.findByIdAndUpdate(
      userId,
      { biografia },
      { new: true, select: "-senha" }
    );

    if (!usuarioAtualizado) {
      return res.status(404).json({
        success: false,
        mensagem: "Usuário não encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      mensagem: "Biografia atualizada com sucesso",
      usuario: usuarioAtualizado,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao atualizar biografia",
    });
  }
});

module.exports = router;
