const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ mensagem: "Acesso negado. verifique o token" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next(); 
  } catch (err) {
    res.status(400).json({ mensagem: "Token inválido" });
  }
};

module.exports = verificarToken;