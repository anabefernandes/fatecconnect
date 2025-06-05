import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";
import "../styles/variables/Colors.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { email, senha });
      
      if (response.data.success) { 
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user || response.data.usuario)); 
        navigate(response.data.redirectTo || response.data.destino);
      } else {
        alert(response.data.mensagem);
      } 
    } catch (err) {
      alert("Erro no login: " + err.response.data.mensagem);
    }
  };

  return (
    <div className="container-fluid d-flex p-0" style={{ height: "100vh" }}>
      {/* lado esquerdo */}
      <div className="login-left col-md-6 d-flex align-items-center justify-content-center">
        <form onSubmit={handleLogin} className="w-75">
          <h2 className="mb-3 text-center d-flex justify-content-between align-items-center">
            <Link to="/" className="btn btn-sm d-flex align-items-center">
              <img
                src="/images/icone-voltar.png"
                alt="Voltar para o início"
                style={{ width: "30px", height: "30px" }}
              />
            </Link>
            <span className="flex-grow-1 text-center" style={{marginLeft:"-30px"}}>Login</span>
          </h2>

          <p className="text-center mb-4 custom-font">
            Não tem uma conta?&nbsp;&nbsp;
            <Link to="/cadastro" className="text-decoration">
              Cadastre-se
            </Link>
          </p>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              E-mail Institucional
            </label>
            <input
              type="email"
              className="form-control form-control-login rounded-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="senha" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control form-control-login rounded-3"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="text-end mb-3">
          <p>
            Esqueceu a senha?&nbsp;&nbsp; 
            <Link to="/solicitar-redefinicao">Redefinir senha</Link>
          </p>
          </div>

          <button type="submit" className="btn btn-danger w-50 rounded-3">
            Entrar
          </button>
        </form>
      </div>

      {/* lado direito */}
      <div className="login-right col-md-6 p-0">
        <img src="/images/fundo-login.png" alt="Fatec Connect" className="w-100 h-100" />
        <div className="overlay-text">
          <img src="/images/fundo-logo-login.png" alt="Fatec Connect" className="w-100 h-100" />
        </div>
      </div>
    </div>
  );
};

export default Login;
