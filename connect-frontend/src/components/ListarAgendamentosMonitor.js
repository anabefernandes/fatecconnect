import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";

export default function ListarAgendamentosMonitor() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [, setMensagem] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setErro("Token não encontrado. Faça login.");
      return;
    }

    const decoded = jwtDecode(token);
    if (decoded.papel !== "monitor") {
      setErro("Acesso restrito aos monitores.");
      return;
    }

    const buscarAgendamentos = async () => {
      try {
        const response = await axios.get(
          "https://fatecconnect-backend.onrender.com/api/agendamentos/monitor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setAgendamentos(response.data.agenda);
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

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const response = await axios.patch(
        `https://fatecconnect-backend.onrender.com/api/agendamentos/${id}/status`,
        { status: novoStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAgendamentos((prev) =>
          prev.map((ag) => (ag._id === id ? { ...ag, status: novoStatus } : ag))
        );
        setMensagem("Status atualizado com sucesso!");
        setTimeout(() => setMensagem(null), 3000);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setErro(err.response?.data?.erro || "Erro ao atualizar status.");
      setTimeout(() => setErro(null), 3000);
    }
  };

  // Filtrar agendamentos
  const pendentesOuEmAndamento = agendamentos.filter(
    (ag) => ag.status !== "cancelado" && ag.status !== "concluído"
  );

  return (
    <>
      <Navbar />
      <SubNavbar />

      <div className="container mt-5">
        <h2 className="text-center mb-4">Agendamentos do Monitor</h2>

        {erro && <div className="alert alert-danger">{erro}</div>}

        {/* Agendamentos pendentes */}
        <div className="mb-5">
          <h4>Pendentes / Em andamento</h4>
          <div className="row">
            {pendentesOuEmAndamento.length === 0 && (
              <p className="text-muted">Nenhum agendamento pendente.</p>
            )}
            {pendentesOuEmAndamento.map((agendamento) => (
              <div key={agendamento._id} className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      Aluno: {agendamento.aluno?.nome || "Desconhecido"}
                    </h5>
                    <p>
                      <strong>Monitor:</strong>{" "}
                      {agendamento.monitor?.nome || "Desconhecido"}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {new Date(agendamento.data).toLocaleString("pt-BR")}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="badge bg-warning text-dark">
                        {agendamento.status}
                      </span>
                    </p>
                    <button
                      className="btn mt-2"
                      style={{
                        backgroundColor: "var(--red-dark)",
                        color: "white",
                      }}
                      onClick={() =>
                        atualizarStatus(agendamento._id, "concluído")
                      }
                    >
                      Concluir Agendamento
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  */}
      </div>
    </>
  );
}
