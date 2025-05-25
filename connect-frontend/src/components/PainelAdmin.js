import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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
  }, []);

  const carregarUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuariosRecebidos = Array.isArray(response.data)
        ? response.data
        : response.data.usuarios || [];

      setUsuarios(usuariosRecebidos);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      alert("Erro ao carregar usuários: " + (err.response?.data?.mensagem || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nomeOk = usuario.nome.toLowerCase().includes(filtros.nome.toLowerCase());
    const papelOk = filtros.papel ? usuario.papel === filtros.papel : true;
    const cursoOk = filtros.curso ? usuario.curso?.toLowerCase().includes(filtros.curso.toLowerCase()) : true;
    return nomeOk && papelOk && cursoOk;
  });

  const handleExcluirUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Usuário excluído com sucesso!");
      carregarUsuarios();
    } catch (err) {
      alert("Erro ao excluir usuário: " + err.response?.data?.mensagem || err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Painel Administrativo</h1>

      <nav style={{ margin: "20px 0", display: "flex", gap: "15px" }}>
        <Link to="/criar-monitor" style={{ textDecoration: "none", color: "#1976d2" }}>
          Criar Monitor
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </nav>

      {/* Filtros */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          name="nome"
          placeholder="Buscar por nome"
          value={filtros.nome}
          onChange={handleFiltroChange}
        />
        <select name="papel" value={filtros.papel} onChange={handleFiltroChange}>
          <option value="">Todos os papéis</option>
          <option value="aluno">Aluno</option>
          <option value="monitor">Monitor</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          name="curso"
          placeholder="Buscar por curso"
          value={filtros.curso}
          onChange={handleFiltroChange}
        />
      </div>

      {/* Lista de Usuários */}
      <div>
        {usuariosFiltrados.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {usuariosFiltrados.map((usuario) => (
              <div
                key={usuario._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  gap: "16px",
                }}
              >
                <img
                  src={usuario.fotoPerfil || "/default-profile.png"}
                  alt="Foto de perfil"
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ flexGrow: 1 }}>
                  <p><strong>Nome:</strong> {usuario.nome}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                  <p><strong>Papel:</strong> {usuario.papel}</p>
                  <p><strong>Curso:</strong> {usuario.curso?.nome || "Não informado"}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link to={`/editar-usuario/${usuario._id}`}>
                    <button style={{ padding: "6px 12px", cursor: "pointer" }}>Editar</button>
                  </Link>
                  <button
                    onClick={() => handleExcluirUsuario(usuario._id)}
                    style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelAdmin;
