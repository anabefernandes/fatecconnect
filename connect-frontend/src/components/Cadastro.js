import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Cadastro.css";
import "../styles/variables/Colors.css";

const Cadastro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    curso: "",
    ra: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await api.get("/cursos");
        setCursos(response.data);
      } catch (error) {
        console.error("Erro ao buscar cursos", error);
      }
    }
    fetchCursos();
  }, []);

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
      await api.post("/cadastro", { nome, curso, ra, email, senha, papel: "aluno" });
      navigate("/login");
    } catch (err) {
      alert("Erro ao cadastrar: " + err.response?.data?.mensagem || "Erro desconhecido");
    }
  };

  return (
    <div className="container-fluid d-flex p-0" style={{ height: "100vh" }}>
      {/* COLUNA ESQUERDA */}
      <div className="cadastro-left col-md-6 d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(/images/fundo-cadastro.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh",
        }}>
        <form onSubmit={handleCadastro} className="w-75">

          <h2 className="mb-3 text-center d-flex justify-content-between align-items-center">
            <Link to="/" className="btn btn-sm d-flex align-items-center">
              <img
                src="/images/icone-voltar.png"
                alt="Voltar para o início"
                style={{ width: "30px", height: "30px" }}
              />
            </Link>
            <span className="flex-grow-1 text-center" style={{ marginLeft: "-30px" }}>
              Cadastre-se
            </span>
          </h2>
          <p className="text-center mb-4 custom-font">
            Já possui uma conta?&nbsp;&nbsp;&nbsp; <Link to="/login" className="text-decoration">Fazer login</Link>
          </p>

          <div className="mb-3">
            <label htmlFor="nome" className="form-label">Nome</label>
            <input
              type="text"
              name="nome"
              className="form-control form-control-cadastro rounded-3"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="curso" className="form-label">Curso</label>
            <select
              name="curso"
              className="form-control form-control-cadastro rounded-3"
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
              className="form-control form-control-cadastro rounded-3"
              value={formData.ra}
              onChange={handleChange}
              required
            />
          </div>
        </form>
      </div>

      {/* COLUNA DIREITA */}
      <div className="cadastro-left col-md-6 d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(/images/fundo-cadastro1.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh",
        }}>
        <form onSubmit={handleCadastro} className="w-75" style={{ marginTop: "162px" }}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Institucional</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-cadastro rounded-3"
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
              className="form-control form-control-cadastro rounded-3"
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
              className="form-control form-control-cadastro rounded-3"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger w-50 rounded-3">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
