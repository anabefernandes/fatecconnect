import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PainelAluno.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./Navbar";

const PainelAluno = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Token:", token);
    console.log("Usuário:", user);

    if (!token) {
      navigate("/");
    } else {
      setUsuario(user);
      console.log("Usuário carregado:", user);
      if (user?.fotoPerfil) {
        setFotoUrl(`http://localhost:5000${user.fotoPerfil}`);
      }
    }
  }, [navigate]);


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
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
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
      <Navbar />
      {/* CONTEÚDO DO PAINEL */}
      <div className="painel-content p-4">
        <h1>Painel do Aluno</h1>

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
            <h4>Olá, {usuario?.nome || "Aluno" }!</h4>
            <button
              className="btn btn-sm btn-secondary mt-1"
              onClick={() => setShowModal(true)}
            >
              Editar Foto
            </button>
          </div>
        </div>

        <p>Bem-vindo ao seu painel, onde você pode ver suas atividades e informações de cursos.</p>
        <button className="btn btn-primary" onClick={() => navigate("/agendar-monitoria")}>
          Agendar Monitoria
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/cadastrovagas")}>
          Cadastrar vagas
        </button>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/postar")}>
          Postar sua dúvida
        </button>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/posts")}>
          Acessar Fórum
        </button>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/agendamentos/aluno")}>
          Acessar Agendamentos
        </button>
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

export default PainelAluno;
