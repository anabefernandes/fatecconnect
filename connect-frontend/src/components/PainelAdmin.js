import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const PainelAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!token || user?.papel !== 'admin') {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Painel Administrativo</h1>
      <nav style={{ margin: '20px 0', display: 'flex', gap: '15px' }}>
        <Link to="/usuarios" style={{ textDecoration: 'none', color: '#1976d2' }}>
          Listar Usuários
        </Link>
        <Link to="/criar-monitor" style={{ textDecoration: 'none', color: '#1976d2' }}>
          Criar Monitor
        </Link>
      </nav>
      <button 
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sair
      </button>
    </div>
  );
};

export default PainelAdmin;