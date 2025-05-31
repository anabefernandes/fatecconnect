// MiniAgendamentos.js
import React from "react";

export default function MiniAgendamentos({ agendamentos, cancelarAgendamento }) {
  if (!agendamentos || agendamentos.length === 0) return <p>Nenhum agendamento encontrado.</p>;

  return (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr>
          <th>Monitor</th>
          <th>Data - Hora</th>
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
                <img
                  src="/images/cancelar.png"
                  alt="Cancelar"
                  title="Cancelar agendamento"
                  onClick={() => cancelarAgendamento(agendamento._id)}
                  style={{
                    width: "28px",
                    height: "28px",
                    cursor: "pointer",
                    display: "inline-block",
                    transition: "filter 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                />
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
