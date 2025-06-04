import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "./Navbar";
import "../styles/PostListar.css"; // Importando o CSS para estilização

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("");

  const carregarUsuario = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNome(response.data.nome);
      setEmail(response.data.email);
      setPapel(response.data.papel);
    } catch (err) {
      alert("Erro ao carregar usuário: " + err.response?.data?.mensagem || "Erro desconhecido.");
    }
  }, [id]);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  const handleEditarUsuario = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/usuarios/${id}`,
        { nome, email, papel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Usuário atualizado com sucesso!");
      navigate("/usuarios");
    } catch (err) {
      alert("Erro ao atualizar usuário: " + err.response?.data?.mensagem || "Erro desconhecido.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Editar Usuário</h2>
          <button
            className="btn-admin"
            onClick={() => navigate("/painel-admin")}
          >
            Painel Admin
          </button>
        </div>

        <form onSubmit={handleEditarUsuario} className="p-4 border rounded shadow-sm bg-light">
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control custom-input"
              placeholder="Digite o nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control custom-input"
              placeholder="Digite o email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Papel</label>
            <select
              className="form-select"
              value={papel}
              onChange={(e) => setPapel(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="monitor">Monitor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>

          <button type="submit" className="btn btn-danger w-100">
            Salvar
          </button>
        </form>
      </div>
    </>
  );
};

export default EditarUsuario;
