import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "./Navbar";
import "../styles/PainelAdmin.css";

const PainelAdmin = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({
    nome: "",
    papel: "",
    curso: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || user?.papel !== "admin") {
      navigate("/login");
    } else {
      carregarUsuarios();
    }
  }, [navigate]);

  const carregarUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data.usuarios || []);
    } catch (err) {
      alert("Erro ao carregar usuários: " + (err.response?.data?.mensagem || err.message));
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nomeOk = usuario.nome.toLowerCase().includes(filtros.nome.toLowerCase());
    const papelOk = filtros.papel ? usuario.papel === filtros.papel : true;
    const cursoOk = filtros.curso
      ? usuario.curso?.nome?.toLowerCase().includes(filtros.curso.toLowerCase())
      : true;
    return nomeOk && papelOk && cursoOk;
  });

  const handleExcluirUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarUsuarios();
    } catch (err) {
      alert("Erro ao excluir usuário: " + (err.response?.data?.mensagem || err.message));
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <h1 className="mb-4 text-center">Painel Administrativo</h1>

        <div className="card filtros-container p-3 mb-4">
          <div className="row align-items-center justify-content-between mb-3">
            <div className="col-auto">
              <h3 className="mb-0">Filtros de Pesquisa</h3>
            </div>
            <div className="col-auto">
              <button className="btn-criamonitor" onClick={() => navigate("/criar-monitor")}>
                Cadastrar Monitor
              </button>
            </div>
          </div>
          <hr />
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="nome" className="form-label">Busca por nome:</label>
              <input
                type="text"
                className="form-control custom-input"
                id="nome"
                name="nome"
                value={filtros.nome}
                onChange={handleFiltroChange}
                placeholder="Digite o nome do aluno"
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="curso" className="form-label">Por Curso:</label>
              <input
                type="text"
                id="curso"
                name="curso"
                className="form-control custom-input"
                value={filtros.curso}
                onChange={handleFiltroChange}
                placeholder="Todos"
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="papel" className="form-label">Tipo de Cadastro:</label>
              <select
                id="papel"
                name="papel"
                className="form-select custom-input"
                value={filtros.papel}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="aluno">Aluno</option>
                <option value="monitor">Monitor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="col-md-2 d-flex gap-2">
              <button className="btn-buscar w-100">🔍 Buscar</button>
            </div>
          </div>
        </div>
        <div className="usuario-header row fw-bold px-1">
          <div className="col-md-1">Foto</div>
          <div className="col-md-3">Nome</div>
          <div className="col-md-5">Email</div>
          <div className="col-md-1">Papel</div>
          <div className="col-md-1">Curso</div>
          <div className="col-md-1 text-center">Ações</div> 
        </div>

        {usuariosFiltrados.map((usuario) => (
          <div key={usuario._id} className="row usuario-linha align-items-center py-2 px-2 border rounded">
            <div className="col-md-1 d-flex align-items-center" data-label="Foto">
              <img
                className="usuario-avatar"
                src={
                  usuario.fotoPerfil
                    ? `https://fatecconnect-backend.onrender.com${usuario.fotoPerfil}`
                    : "/images/usuario-padrao.png"
                }
                alt="Foto de perfil"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-3" data-label="Nome">{usuario.nome}</div>
            <div className="col-md-5" data-label="Email">{usuario.email}</div>
            <div className="col-md-1 text-capitalize" data-label="Papel">{usuario.papel}</div>
            <div className="col-md-1" data-label="Curso">{usuario.curso?.nome || "Não informado"}</div>
            <div className="col-md-1 d-flex justify-content-center gap-2" data-label="Ações">
              <Link to={`/editar-usuario/${usuario._id}`}>
                <img
                  src="/images/editar.png"
                  alt="Editar"
                  className="icone-acao"
                   style={{ cursor: 'pointer', width: '28px', height: '28px' }}
                />
              </Link>
              <img
                src="/images/cancelar.png"
                alt="Excluir"
                className="icone-acao"
                onClick={() => handleExcluirUsuario(usuario._id)}
                style={{ cursor: 'pointer', width: '24px', height: '24px', marginTop: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PainelAdmin;
