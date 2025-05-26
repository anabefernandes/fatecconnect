import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <>
    {/* NavBar principal*/}
    <nav className="navbar-main d-flex align-items-center px-3 py-2 shadow-sm">
      <div className="logo-area">
        <img src="/images/logo.png" alt="Logo" className="logo-img" />
      </div>

      <div className="search-bar mx-auto d-flex align-items-center">
        <img src="/images/lupa.png" alt="Lupa" className="search-icon-img" />
        <input
          type="text"
          className="search-input"
          placeholder="Pesquisar..."
        />
      </div>

      <div className="logout-area ms-auto">
        <button className="btn btn-link logout-btn" onClick={handleLogout}>
          <img src="/images/sair.png" alt="Sair" className="logout-img" />
        </button>
      </div>
    </nav>    
    </>
  );
};

export default Navbar;
