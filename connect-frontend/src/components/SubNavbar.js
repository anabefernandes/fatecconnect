import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const SubNavbar = () => {
  const navigate = useNavigate();

  const botoes = [
    { src: "/images/home.png", alt: "Home", path: "/home" },
    { src: "/images/vagas.png", alt: "Monitoria", path: "/monitorias" },
    { src: "/images/painel-usuario.png", alt: "Perfil", path: "/perfil" },
    { src: "/images/chat-subNavBar.png", alt: "Fórum", path: "/forum" },
    { src: "/images/agenda.png", alt: "Agenda", path: "/agenda" },
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
