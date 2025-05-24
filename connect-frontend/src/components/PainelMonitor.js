import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PainelAluno.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const PainelMonitor = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/");
    } else {
      setUsuario(user);
      if (user?.fotoPerfil) {
        setFotoUrl(`http://localhost:5000${user.fotoPerfil}`);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("foto", selectedImage);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/upload-foto", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newFotoUrl = `http://localhost:5000${data.path}`;
        alert("Foto enviada com sucesso!");

        const updatedUser = { ...usuario, fotoPerfil: data.path };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUsuario(updatedUser);
        setFotoUrl(newFotoUrl);

        setShowModal(false);
        setSelectedImage(null);
        setPreview(null);
      } else {
        alert("Erro ao enviar foto.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro na requisição.");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar-aluno d-flex align-items-center px-3 py-2 shadow-sm">
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

      {/* CONTEÚDO DO PAINEL */}
      <div className="painel-content p-4">
        <h1>Painel do Monitor</h1>

        {/* Foto e Saudação */}
        <div className="d-flex align-items-center gap-3 my-4">
          <img
            src={fotoUrl || "/images/default-user.png"}
            alt="Foto de Perfil"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h4>Olá, {usuario?.nome || "Monitor"}!</h4>
            <button
              className="btn btn-sm btn-secondary mt-1"
              onClick={() => setShowModal(true)}
            >
              Editar Foto
            </button>
          </div>
        </div>

        <p>Bem-vindo ao seu painel, onde você pode gerenciar suas atividades como monitor.</p>

        <div className="d-flex gap-3 flex-wrap">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/agendamentos")}
          >
            Ver Agendamentos
          </button>
        </div>
      </div>

      {/* MODAL DE UPLOAD DE FOTO */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enviar Foto de Perfil</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {preview && <img src={preview} alt="Preview" className="img-fluid mt-3 rounded" />}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleUpload}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PainelMonitor;
