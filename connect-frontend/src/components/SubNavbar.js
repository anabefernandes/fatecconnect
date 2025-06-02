import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const user = JSON.parse(localStorage.getItem("user"));

const rotaPainel =
  user?.papel === "admin"
    ? "/painel-admin"
    : user?.papel === "monitor"
    ? "/painel-monitor"
    : "/painel-aluno";

const SubNavbar = () => {
  const navigate = useNavigate();

  const botoes = [
    { src: "/images/home.png", alt: "Home", path: "/posts" },
    { src: "/images/vagas.png", alt: "Vagas", path: "/vagas" },
    { src: "/images/painel-usuario.png", alt: "Perfil", path: rotaPainel },
    { src: "/images/chat-subNavBar.png", alt: "Fórum", path: "/posts" },
    { src: "/images/agenda.png", alt: "Agenda", path: "/agendar-monitoria" },
  ];

  return (
    <>
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
    </>
  );
};

export default SubNavbar;
