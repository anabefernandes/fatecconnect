import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";


const ListarUsuarios = () => {
  const navigate = useNavigate();
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
      const usuariosRecebidos = Array.isArray(response.data)
        ? response.data
        : response.data.usuarios || [];
      setUsuarios(usuariosRecebidos);
    } catch (err) {
      alert(
        "Erro ao carregar usuários: " +
        (err.response?.data?.mensagem || err.message)
      );
    }
  };

  const handleExcluirUsuario = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarUsuarios();
    } catch (err) {
      alert("Erro ao excluir usuário: " + err.response?.data?.mensagem);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="mb-5">Lista de Usuários</h2>
          <button
            className="btn-admin"
            onClick={() => navigate("/painel-admin")}
          >
            Painel Admin
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-danger">
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario._id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.papel}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                      <Link to={`/editar-usuario/${usuario._id}`}>
                        <img
                          src="/images/editar.png"
                          alt="Editar"
                          width="24"
                          height="24"
                          style={{ cursor: "pointer" }}
                        />
                      </Link>
                      <img
                        src="/images/cancelar.png"
                        alt="Excluir"
                        width="24"
                        height="24"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleExcluirUsuario(usuario._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ListarUsuarios;
