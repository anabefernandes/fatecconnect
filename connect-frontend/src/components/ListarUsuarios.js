import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const ListarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Resposta da API /usuarios:", response.data);

      const usuariosRecebidos = Array.isArray(response.data)
      ? response.data
      : response.data.usuarios || [];

      setUsuarios(usuariosRecebidos);
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    alert("Erro ao carregar usuários: " + (err.response?.data?.mensagem || err.message));
  }
};

  const handleExcluirUsuario = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Usuário excluído com sucesso!");
      carregarUsuarios(); // Recarrega a lista de usuários
    } catch (err) {
      alert("Erro ao excluir usuário: " + err.response.data.mensagem);
    }
  };

  return (
    <div>
      <h2>Lista de Usuários</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Papel</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario._id}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.papel}</td>
              <td>
                <Link to={`/editar-usuario/${usuario._id}`}>Editar</Link>
                <button onClick={() => handleExcluirUsuario(usuario._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListarUsuarios;