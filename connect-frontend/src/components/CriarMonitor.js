import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Cadastro.css";
import "../styles/variables/Colors.css";
import Navbar from "./Navbar";

const CriarMonitor = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    curso: "",
    ra: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.papel !== "admin") {
      navigate("/login");
    }

    async function fetchCursos() {
      try {
        const response = await api.get("/cursos");
        setCursos(response.data);
      } catch (error) {
        console.error("Erro ao buscar cursos", error);
      }
    }

    fetchCursos();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    const { nome, curso, ra, email, senha, confirmarSenha } = formData;

    if (!email.endsWith("@fatec.sp.gov.br")) {
      return alert("Apenas emails @fatec.sp.gov.br são permitidos");
    }

    if (senha !== confirmarSenha) {
      return alert("As senhas não coincidem");
    }

    try {
      await api.post("/criar-monitor", { nome, curso, ra, email, senha, papel: "monitor" });      
      navigate("/painel-admin"); 
    } catch (err) {
      alert("Erro ao cadastrar: " + err.response?.data?.mensagem || "Erro desconhecido");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid d-flex p-0" style={{ height: "100%" }}>
        {/* COLUNA ESQUERDA */}
        <div className="cadastro-left col-md-6 d-flex align-items-center justify-content-center"
          style={{
            backgroundImage: `url(/images/fundo-cadastro.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "93vh",
          }}>
          <form onSubmit={handleCadastro} className="w-75">
            <h2 className="mb-3 text-center d-flex justify-content-between align-items-center">
              <Link to="/painel-admin" className="btn btn-sm d-flex align-items-center">
                <img
                  src="/images/icone-voltar.png"
                  alt="Voltar para o início"
                  style={{ width: "30px", height: "30px" }}
                />
              </Link>
              <span className="flex-grow-1 text-center" style={{ marginLeft: "-30px" }}>
                Cadastrar Monitor
              </span>
            </h2>

            <div className="mb-3">
              <label htmlFor="nome" className="form-label">Nome</label>
              <input
                type="text"
                name="nome"
                className="form-control rounded-3"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="curso" className="form-label">Curso</label>
              <select
                name="curso"
                className="form-control rounded-3"
                value={formData.curso}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um curso</option>
                {cursos
                  .filter(curso => curso.nome !== "Admin")
                  .map((curso) => (
                    <option key={curso._id} value={curso.nome}>
                      {curso.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="ra" className="form-label">RA</label>
              <input
                type="text"
                name="ra"
                className="form-control rounded-3"
                value={formData.ra}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </div>

        {/* COLUNA DIREITA */}
        <div className="cadastro-left col-md-6 d-flex align-items-center justify-content-center position-relative"
          style={{
            backgroundImage: `url(/images/fundo-cadastro1.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "93vh",
          }}>
          <button
            className="btn-admin position-absolute"
            style={{ top: "20px", right: "20px", zIndex: 10 }}
            onClick={() => navigate("/painel-admin")}
          >
            Painel Admin
          </button>
          <form onSubmit={handleCadastro} className="w-75" style={{ marginTop: "162px" }}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Institucional</label>
              <input
                type="email"
                name="email"
                className="form-control rounded-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="senha" className="form-label">Senha</label>
              <input
                type="password"
                name="senha"
                className="form-control rounded-3"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmarSenha" className="form-label">Confirme sua senha</label>
              <input
                type="password"
                name="confirmarSenha"
                className="form-control rounded-3"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger w-50 rounded-3">
              Cadastrar Monitor
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CriarMonitor;
