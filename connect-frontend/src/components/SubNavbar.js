import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const SubNavbar = () => {
  const navigate = useNavigate();
  const [rotaPainel, setRotaPainel] = useState("/painel-aluno");
  const [rotaAgenda, setRotaAgenda] = useState("/agendar-monitoria");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.papel === "admin") {
      setRotaPainel("/painel-admin");
      setRotaAgenda("/agendar-monitoria"); // Admin vê como aluno
    } else if (user?.papel === "monitor") {
      setRotaPainel("/painel-monitor");
      setRotaAgenda("/agendamentos/monitor"); // Monitor vê seus agendamentos
    } else {
      setRotaPainel("/painel-aluno");
      setRotaAgenda("/agendar-monitoria"); // Aluno agenda monitoria
    }
  }, []);

  const botoes = [
    { src: "/images/home.png", alt: "Home", path: "/posts" },
    { src: "/images/vagas.png", alt: "Vagas", path: "/vagas" },
    { src: "/images/painel-usuario.png", alt: "Perfil", path: rotaPainel },
    { src: "/images/agenda.png", alt: "Agenda", path: rotaAgenda },
  ];

  return (
    <div className="subnavbar-container d-flex justify-content-center gap-3 py-2">
      {botoes.map((btn, index) => (
        <button
          key={index}
          className="subnavbar-btn"
          onClick={() => navigate(btn.path)}
        >
          <img src={btn.src} alt={btn.alt} className="subnavbar-icon" />
        </button>
      ))}
    </div>
  );
};

export default SubNavbar;
