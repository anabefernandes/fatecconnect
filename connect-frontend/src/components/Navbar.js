import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/posts?termo=${encodeURIComponent(busca)}`);
    }
  };

  return (
    <nav className="navbar-main d-flex align-items-center px-3 py-2 shadow-sm">
      <div className="logo-area">
        <img src="/images/logo.png" alt="Logo" className="logo-img" />
      </div>

      {/* Renderiza a barra de busca apenas na rota /posts */}
      {location.pathname === "/posts" && (
        <div className="search-bar mx-auto d-flex align-items-center">
          <img src="/images/lupa.png" alt="Lupa" className="search-icon-img" />
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      )}

      <div className="logout-area ms-auto">
        <button className="btn btn-link logout-btn" onClick={handleLogout}>
          <img src="/images/sair.png" alt="Sair" className="logout-img" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
