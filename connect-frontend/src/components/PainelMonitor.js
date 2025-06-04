import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PainelAluno.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import api from "../services/api";

const PainelMonitor = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  const [showBioModal, setShowBioModal] = useState(false);
  const [biografia, setBiografia] = useState("");
  const [novaBiografia, setNovaBiografia] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data } = await api.get("/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.usuario) {
          setUsuario(data.usuario);
          setBiografia(data.usuario.biografia || "");
          if (data.usuario.fotoPerfil) {
            setFotoUrl(
              `https://fatecconnect-backend.onrender.com${data.usuario.fotoPerfil}`
            );
          }

          localStorage.setItem("user", JSON.stringify(data.usuario));
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSalvarBiografia = async () => {
    if (!novaBiografia.trim()) {
      alert("A biografia não pode estar vazia.");
      return;
    }

    try {
      const { data } = await api.post("/biografia", {
        biografia: novaBiografia,
      });

      if (data.success) {
        const updatedUser = { ...usuario, biografia: data.usuario.biografia };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUsuario(updatedUser);
        setBiografia(data.usuario.biografia);

        alert("Biografia atualizada com sucesso!");
        setShowBioModal(false);
      } else {
        alert(data.mensagem || "Erro ao atualizar biografia.");
      }
    } catch (error) {
      console.error("Erro ao atualizar biografia:", error);
      alert("Erro na requisição.");
    }
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

    try {
      const { data } = await api.post("/upload-foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newFotoUrl = `https://fatecconnect-backend.onrender.com${data.path}`;
      alert("Foto enviada com sucesso!");

      const updatedUser = { ...usuario, fotoPerfil: data.path };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUsuario(updatedUser);
      setFotoUrl(newFotoUrl);

      setShowModal(false);
      setSelectedImage(null);
      setPreview(null);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro na requisição.");
    }
  };

  return (
    <>
      <Navbar />
      <SubNavbar/>

      <div className="painel-content p-4">
        <h1>Painel do Monitor</h1>

        {/* Foto e Saudação */}
        <div className="d-flex align-items-center gap-3 my-4">
          <img
            src={fotoUrl || "/images/usuario_padrao.png"}
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

        <p>
          Bem-vindo ao seu painel, onde você pode gerenciar suas atividades como
          monitor.
        </p>

        <div className="mt-3">
          <h5>Biografia</h5>
          <p>{biografia}</p>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              setNovaBiografia(biografia);
              setShowBioModal(true);
            }}
          >
            Editar Biografia
          </button>
        </div>

        <div className="d-flex gap-3 flex-wrap mt-4">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/agendamentos/monitor")}
          >
            Ver Agendamentos
          </button>
        </div>
      </div>

      {/* MODAL DE UPLOAD DE FOTO */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enviar Foto de Perfil</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="img-fluid mt-3 rounded"
                  />
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleUpload}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE BIOGRAFIA */}
      {showBioModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Biografia</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBioModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="4"
                  value={novaBiografia}
                  onChange={(e) => setNovaBiografia(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBioModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSalvarBiografia}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PainelMonitor;
