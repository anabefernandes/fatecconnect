const verificarAdmin = (req, res, next) => {
    if (req.user.papel !== "admin") {
      return res.status(403).json({ mensagem: "Acesso negado. Somente admin pode realizar esta ação." });
    }
    next();
  };
  
  module.exports = verificarAdmin;

