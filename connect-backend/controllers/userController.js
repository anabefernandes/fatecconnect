const User = require("../models/User");
const Curso = require("../models/Curso");

const handleError = (res, err, status = 500) => {
  console.error(err);
  return res.status(status).json({
    success: false,
    mensagem: status === 500 ? "Erro no servidor" : err.message,
  });
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, { senha: 0 }).populate("curso").lean();
    res.status(200).json({ success: true, usuarios });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.obterUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, mensagem: "Não encontrado" });
    res.status(200).json({ success: true, usuario });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, papel } = req.body;

    const usuario = await User.findByIdAndUpdate(id, { nome, email, papel }, { new: true });
    if (!usuario) return res.status(404).json({ success: false, mensagem: "Não encontrado" });

    res.status(200).json({ success: true, mensagem: "Atualizado com sucesso", usuario });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.excluirUsuario = async (req, res) => {
  try {
    const usuario = await User.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, mensagem: "Não encontrado" });

    res.status(200).json({ success: true, mensagem: "Usuário excluído com sucesso" });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ mensagem: "Erro ao buscar cursos" });
  }
};
