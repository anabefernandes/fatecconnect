import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";
import SubNavBar from "./SubNavbar";
import MiniAgendamentos from "./MiniAgendamentos";

export default function ListarAgendamentosAluno({ limite, comNavs = true }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setErro("Token não encontrado. Faça login.");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      setErro("Token inválido.");
      return;
    }

    if (decoded.papel !== "aluno") {
      setErro("Acesso restrito aos alunos.");
      return;
    }

    const buscarAgendamentos = async () => {
      try {
        const response = await axios.get(
          "https://fatecconnect-backend.onrender.com/api/agendamentos/aluno",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const ordenados = response.data.agenda.sort(
            (a, b) => new Date(b.data) - new Date(a.data)
          );
          setAgendamentos(ordenados);
        } else {
          setErro("Não foi possível carregar os agendamentos.");
        }
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        setErro(err.response?.data?.erro || "Erro ao buscar agendamentos.");
      }
    };

    buscarAgendamentos();
  }, [token]);

  const cancelarAgendamento = async (id) => {
    try {
      const response = await axios.patch(
        `https://fatecconnect-backend.onrender.com/api/agendamentos/${id}/status`,
        { status: "cancelado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAgendamentos((prev) =>
          prev.map((ag) =>
            ag._id === id ? { ...ag, status: "cancelado" } : ag
          )
        );
        setMensagem("Agendamento cancelado com sucesso!");
        setErro(null);
      }
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      setErro(err.response?.data?.erro || "Erro ao cancelar agendamento.");
    }
  };

  const agendamentosExibidos = limite
    ? agendamentos.slice(0, limite)
    : agendamentos;

  return (
    <>
      {comNavs && (
        <>
          <NavBar />
          <SubNavBar />
        </>
      )}

      <div className="container mt-4">
        <h2 className="mb-4">
          {limite
            ? `Agendamentos Recentes`
            : "Meus agendamentos"}
        </h2>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        <MiniAgendamentos
          agendamentos={agendamentosExibidos}
          cancelarAgendamento={cancelarAgendamento}
        />

        {limite && agendamentos.length > limite && (
          <div className="text-center mt-3">
            <Link to="/agendamentos/aluno"
              className="btn"
              style={{
                border: "2px solid var(--red-dark)",
                color: "var(--red-dead)",
                backgroundColor: "transparent",
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--red-light)";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "var(--red-dark)";
              }}
            >
              Ver todos
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
