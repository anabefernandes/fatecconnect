const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Curso = require("../models/Curso");
const sendEmail = require("../mail");

let resetTokens = {};

const handleError = (res, err, status = 500) => {
  console.error(err);
  return res.status(status).json({
    success: false,
    mensagem: status === 500 ? "Erro no servidor" : err.message,
  });
};

//ENDPOINTS AUTH

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email }).select("+senha").populate("curso", "nome");
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ success: false, mensagem: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: usuario._id, papel: usuario.papel }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const redirectTo = {
      admin: "/painel-admin",
      monitor: "/painel-monitor",
      aluno: "/painel-aluno"
    }[usuario.papel] || "/";

    return res.json({
      success: true,
      token,
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        curso: usuario.curso.nome,
        ra: usuario.ra,
        fotoPerfil: usuario.fotoPerfil,
      },
      redirectTo,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.cadastroAluno = async (req, res) => {
  try {
    const { nome, email, senha, papel, curso: cursoNome, ra } = req.body;

    if (!email.endsWith("@fatec.sp.gov.br")) {
      return res.status(400).json({ success: false, mensagem: "Email inválido" });
    }

    if (await User.findOne({ email }) || await User.findOne({ ra })) {
      return res.status(400).json({ success: false, mensagem: "Email ou RA já cadastrado" });
    }

    const curso = await Curso.findOne({ nome: cursoNome });
    if (!curso) return res.status(400).json({ success: false, mensagem: "Curso não encontrado" });

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
};

exports.criarMonitor = async (req, res) => {
  try {
    const { nome, email, senha, ra, curso: cursoNome } = req.body;

    if (!email.endsWith("@fatec.sp.gov.br")) {
      return res.status(400).json({ success: false, mensagem: "Email inválido" });
    }

    if (await User.findOne({ email }) || await User.findOne({ ra })) {
      return res.status(400).json({ success: false, mensagem: "Email ou RA já cadastrado" });
    }

    const curso = await Curso.findOne({ nome: cursoNome });
    if (!curso) return res.status(400).json({ success: false, mensagem: "Curso não encontrado" });

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
};

exports.solicitarRedefinicao = async (req, res) => {
  const { email } = req.body;
  const usuario = await User.findOne({ email });
  if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });

  const token = Math.random().toString(36).substr(2, 8);
  resetTokens[token] = email;

  try {
    await sendEmail(email, "Redefinição de senha", `Token: ${token}`);
    res.json({ mensagem: "Token enviado por e-mail." });
  } catch {
    res.status(500).json({ mensagem: "Erro ao enviar o e-mail." });
  }
};

exports.redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  const email = resetTokens[token];
  if (!email) return res.status(400).json({ mensagem: "Token inválido ou expirado." });

  const usuario = await User.findOne({ email });
  if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });

  usuario.senha = await bcrypt.hash(novaSenha, 10);
  await usuario.save();
  delete resetTokens[token];

  res.json({ mensagem: "Senha redefinida com sucesso!" });
};
