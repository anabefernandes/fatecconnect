import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/RedefinicaoSenha.css";
import "../styles/variables/Colors.css";

const RedefinicaoSenhaUnificada = () => {
  const [email, setEmail] = useState("");
  const [mensagemSolicitacao, setMensagemSolicitacao] = useState("");
  const [erroSolicitacao, setErroSolicitacao] = useState("");

  const [token, setToken] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagemRedefinicao, setMensagemRedefinicao] = useState("");
  const [erroRedefinicao, setErroRedefinicao] = useState("");

  const navigate = useNavigate();

  const handleSolicitar = async (e) => {
    e.preventDefault();
    setMensagemSolicitacao("");
    setErroSolicitacao("");

    try {
      const response = await axios.post("http://localhost:5000/api/solicitar-redefinicao", { email });

      if (response.data?.mensagem) {
        setMensagemSolicitacao(response.data.mensagem);
      } else {
        setMensagemSolicitacao("Se o e-mail estiver cadastrado, você receberá um link.");
      }
    } catch (err) {
      setErroSolicitacao(err.response?.data?.mensagem || "Erro ao solicitar redefinição.");
    }
  };

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setErroRedefinicao("");
    setMensagemRedefinicao("");

    if (senha !== confirmarSenha) {
      setErroRedefinicao("As senhas não coincidem.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/redefinir-senha", {
        token,
        novaSenha: senha,
      });

      if (res.data?.mensagem) {
        setMensagemRedefinicao(res.data.mensagem);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErroRedefinicao("Erro inesperado ao redefinir a senha.");
      }
    } catch (err) {
      setErroRedefinicao("Erro ao redefinir a senha. Tente novamente.");
    }
  };

  return (
    <div className="container-fluid d-flex flex-row p-0" style={{ minHeight: "100vh" }}>
      
      {/* Lado esquerdo - Formulários */}
      <div className="login-left col-md-6 d-flex align-items-center justify-content-center bg-light">
        <div className="w-75">
          <form onSubmit={handleSolicitar}>
            <h2 className="mb-3 text-center d-flex justify-content-between align-items-center">
              <Link to="/login" className="btn btn-sm d-flex align-items-center">
                <img
                  src="/images/icone-voltar.png"
                  alt="Voltar"
                  style={{ width: "30px", height: "30px" }}
                />
              </Link>
              <span className="flex-grow-1 text-center" style={{ marginLeft: "-30px" }}>
                Redefinir Senha
              </span>
            </h2>

            <p className="text-center mb-4">Informe o e-mail institucional para receber o link:</p>

            <div className="mb-3">
              <label className="form-label">E-mail Institucional</label>
              <input
                type="email"
                className="form-control rounded-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger w-100 rounded-3 mb-2">Enviar Link</button>
            {mensagemSolicitacao && <p className="text-success">{mensagemSolicitacao}</p>}
            {erroSolicitacao && <p className="text-danger">{erroSolicitacao}</p>}
          </form>

          <hr className="my-4" />

          <form onSubmit={handleRedefinir}>
            <div className="mb-3">
              <label className="form-label">Token</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Cole aqui o token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nova senha</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="Nova senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar nova senha</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger w-100 rounded-3">Redefinir senha</button>
            {mensagemRedefinicao && <p className="text-success mt-2">{mensagemRedefinicao}</p>}
            {erroRedefinicao && <p className="text-danger mt-2">{erroRedefinicao}</p>}
          </form>
        </div>
      </div>

      {/* Lado direito - Imagem com overlay */}
      <div className="login-right col-md-6 position-relative p-0">
        <img
          src="/images/fundo-login.png"
          alt="Fatec Connect"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <img
            src="/images/fundo-logo-login.png"
            alt="Fatec Connect Logo"
            style={{ width: "60%", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
};

export default RedefinicaoSenhaUnificada;
