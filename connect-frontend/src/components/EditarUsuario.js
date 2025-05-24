import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

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
      alert("Erro ao carregar usuário: " + err.response.data.mensagem);
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
      navigate("/usuarios"); // Redireciona para a lista de usuários
    } catch (err) {
      alert("Erro ao atualizar usuário: " + err.response.data.mensagem);
    }
  };

  return (
    <form onSubmit={handleEditarUsuario}>
      <h2>Editar Usuário</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select value={papel} onChange={(e) => setPapel(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="monitor">Monitor</option>
        <option value="aluno">Aluno</option>
      </select>
      <button type="submit">Salvar</button>
    </form>
  );
};

export default EditarUsuario;