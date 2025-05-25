const User = require("../models/User");

exports.uploadFoto = async (req, res) => {
  try {
    const filePath = `/uploads/${req.file.filename}`;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fotoPerfil: filePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, mensagem: "Usuário não encontrado" });
    }

    res.status(200).json({
      success: true,
      mensagem: "Imagem salva com sucesso",
      path: filePath,
      usuario: {
        nome: updatedUser.nome,
        email: updatedUser.email,
        fotoPerfil: updatedUser.fotoPerfil
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, mensagem: "Erro ao salvar imagem" });
  }
};
