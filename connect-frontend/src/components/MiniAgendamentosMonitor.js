import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

export default function MiniAgendamentosMonitor() {
    const [agendamentos, setAgendamentos] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        if (decoded.papel !== "monitor") return;

        const buscarAgendamentos = async () => {
            try {
                const response = await axios.get("https://fatecconnect-backend.onrender.com/api/agendamentos/monitor", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    const pendentes = response.data.agenda.filter(
                        (ag) => ag.status !== "cancelado" && ag.status !== "concluído"
                    );
                    const recentes = pendentes
                        .sort((a, b) => new Date(b.data) - new Date(a.data))
                        .slice(0, 5);

                    setAgendamentos(recentes);
                }
            } catch (err) {
                console.error("Erro ao buscar agendamentos resumidos:", err);
            }
        };

        buscarAgendamentos();
    }, []);

    return (
        <div className="mt-4">
            <h6 className="fw-bold mb-2">Agendamentos Recentes</h6>
            {agendamentos.length === 0 ? (
                <p className="text-muted">Nenhum agendamento recente.</p>
            ) : (
                <ul className="list-group">
                    {agendamentos.map((ag) => (
                        <li key={ag._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span style={{ fontSize: "0.95rem" }}>
                                {new Date(ag.data).toLocaleString("pt-BR")}
                            </span>
                            <span className="badge bg-warning text-dark">{ag.status}</span>
                        </li>
                    ))}
                </ul>
            )}
                <div className="text-center mt-3">
                    <Link to="/agendamentos/monitor"
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
        </div>
    );
}
