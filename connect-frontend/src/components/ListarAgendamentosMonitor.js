import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function ListarAgendamentosMonitor() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("TOKEN:", token);
    if (!token) {
      setErro("Token não encontrado. Faça login.");
      return;
      
    }

    const decoded = jwtDecode(token);
    const papel = decoded.papel;

    if (papel !== "monitor") {
      setErro("Acesso restrito aos monitores.");
      return;
    }

    const buscarAgendamentos = async () => {
      try {
        const response = await axios.get("https://fatecconnect-backend.onrender.com/api/agendamentos/monitor", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setErro(err.response?.data?.erro || "Erro ao atualizar status.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Agendamentos como Monitor</h2>

      {erro && <p className="text-red-600">{erro}</p>}
      {mensagem && <p className="text-green-600">{mensagem}</p>}

      {agendamentos.length === 0 && !erro && <p>Nenhum agendamento encontrado.</p>}

      <div className="space-y-4">
        {agendamentos.map((agendamento) => (
          <div key={agendamento._id} className="p-4 border rounded shadow">
            <p><strong>Aluno:</strong> {agendamento.aluno?.nome || "Desconhecido"}</p>
            <p><strong>Monitor:</strong> {agendamento.monitor?.nome || "Desconhecido"}</p>
            <p><strong>Data:</strong> {new Date(agendamento.data).toLocaleString("pt-BR")}</p>
            <p><strong>Status:</strong> {agendamento.status}</p>

            <div className="mt-2 space-x-2">
  {agendamento.status !== "concluído" && agendamento.status !== "cancelado" && (
    <button
      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
      onClick={() => atualizarStatus(agendamento._id, "concluído")}
    >
      Concluir
    </button>
  )}
</div>
          </div>
        ))}
      </div>
    </div>
  );
}
