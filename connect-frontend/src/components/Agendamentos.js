import React, { useEffect, useState } from "react";
import api from "../services/api";

const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await api.get("/agendamentos/monitor");
        setAgendamentos(res.data.agendamentos);
      } catch (err) {
        console.error(err);
      }
    };
    buscar();
  }, []);

  return (
    <div>
      <h2>Meus Agendamentos</h2>
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <ul>
          {agendamentos.map((a) => (
            <li key={a._id}>
              <strong>Aluno:</strong> {a.aluno.nome} | <strong>Horário:</strong>{" "}
              {new Date(a.horario).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Agendamentos;
