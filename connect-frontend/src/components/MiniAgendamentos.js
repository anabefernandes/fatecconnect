// MiniAgendamentos.js
import React from "react";

export default function MiniAgendamentos({ agendamentos, cancelarAgendamento }) {
  if (!agendamentos || agendamentos.length === 0) return <p>Nenhum agendamento encontrado.</p>;

  return (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr>
          <th>Monitor</th>
          <th>Data</th>
          <th>Status</th>
          <th style={{ width: "120px" }} className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {agendamentos.map((agendamento) => (
          <tr key={agendamento._id}>
            <td>{agendamento.monitor?.nome || "Desconhecido"}</td>
            <td>{new Date(agendamento.data).toLocaleString("pt-BR")}</td>
            <td className="text-capitalize">{agendamento.status}</td>
            <td className="text-center">
              {agendamento.status !== "cancelado" && agendamento.status !== "concluído" ? (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => cancelarAgendamento(agendamento._id)}
                >
                  Cancelar
                </button>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
