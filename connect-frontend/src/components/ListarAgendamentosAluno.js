import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function ListarAgendamentosAluno() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setErro("Token não encontrado. Faça login.");
      return;
    }

    const decoded = jwtDecode(token);
    const papel = decoded.papel;

    if (papel !== "aluno") {
      setErro("Acesso restrito aos alunos.");
      return;
    }

    const buscarAgendamentos = async () => {
      try {
        const response = await axios.get("https://fatecconnect-backend.onrender.com/api/agendamentos/aluno", {
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

  const cancelarAgendamento = async (id) => {
    try {
      const response = await axios.patch(
        `https://fatecconnect-backend.onrender.com/api/agendamentos/${id}/status`,
        { status: "cancelado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAgendamentos((prev) =>
          prev.map((ag) => (ag._id === id ? { ...ag, status: "cancelado" } : ag))
        );
        setMensagem("Agendamento cancelado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      setErro(err.response?.data?.erro || "Erro ao cancelar agendamento.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Meus Agendamentos</h2>

      {erro && <p className="text-red-600">{erro}</p>}
      {mensagem && <p className="text-green-600">{mensagem}</p>}

      {agendamentos.length === 0 && !erro && <p>Nenhum agendamento encontrado.</p>}

      <div className="space-y-4">
        {agendamentos.map((agendamento) => (
          <div key={agendamento._id} className="p-4 border rounded shadow">
            <p><strong>Monitor:</strong> {agendamento.monitor?.nome || "Desconhecido"}</p>
            <p><strong>Data:</strong> {new Date(agendamento.data).toLocaleString("pt-BR")}</p>
            <p><strong>Status:</strong> {agendamento.status}</p>

            <div className="mt-2 space-x-2">
              {agendamento.status !== "cancelado" && agendamento.status !== "concluído" &&(
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => cancelarAgendamento(agendamento._id)}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
