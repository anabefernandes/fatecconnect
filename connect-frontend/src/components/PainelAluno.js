import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PainelAluno.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import api from "../services/api";

const PainelAluno = () => {
  const navigate = useNavigate();

  const [tituloPost, setTituloPost] = useState("");
  const [conteudoPost, setConteudoPost] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [mensagemPost, setMensagemPost] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  const [showBioModal, setShowBioModal] = useState(false);
  const [biografia, setBiografia] = useState("");
  const [novaBiografia, setNovaBiografia] = useState("");

  const [meusPosts, setMeusPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      await Promise.all([fetchUserData(token), fetchMeusPosts(token)]);
    };

    const fetchUserData = async (token) => {
      try {
        const { data } = await api.get("/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(data.usuario);
        setBiografia(data.usuario.biografia || "");
        setFotoUrl(
          data.usuario.fotoPerfil
            ? `https://fatecconnect-backend.onrender.com${data.usuario.fotoPerfil}`
            : null
        );
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        navigate("/");
      }
    };

    const fetchMeusPosts = async (token) => {
      try {
        const { data } = await api.get("/meus-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeusPosts(data);
      } catch (error) {
        console.error("Erro ao buscar posts do usuário:", error);
      }
    };

    loadData();
  }, [navigate]);

  const handlePostar = async () => {
    if (!tituloPost.trim() || !conteudoPost.trim()) {
      alert("Preencha todos os campos para postar.");
      return;
    }

    setLoadingPost(true);
    try {
      await api.post(
        "/postar",
        { titulo: tituloPost, conteudo: conteudoPost },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTituloPost("");
      setConteudoPost("");
      setMensagemPost("Post criado com sucesso!");

      const { data } = await api.get("/meus-posts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMeusPosts(data);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setMensagemPost("Erro ao criar post");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleSalvarBiografia = async () => {
    if (!novaBiografia.trim()) {
      alert("A biografia não pode estar vazia.");
      return;
    }

    try {
      const { data } = await api.post(
        "/biografia",
        { biografia: novaBiografia },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

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
      <SubNavbar />

      <div className="painel-content p-4">
        <h1>Painel do Aluno</h1>

        <div className="row mt-4">
          {/* Coluna da esquerda: Perfil e ações */}
          <div className="col-md-5">
            {/* Foto e Saudação */}
            <div className="d-flex align-items-center gap-3 mb-4">
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
                <h4>Olá, {usuario?.nome || "Aluno"}!</h4>
                <button
                  className="btn btn-sm btn-secondary mt-1"
                  onClick={() => setShowModal(true)}
                >
                  Editar Foto
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h5>Biografia</h5>
              <p>{biografia || "Nenhuma biografia cadastrada."}</p>
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

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/cadastrovagas")}
              >
                Cadastrar vagas
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/vagas")}
              >
                Lista vagas
              </button>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/postar")}
              >
                Postar sua dúvida
              </button>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/agendamentos/aluno")}
              >
                Acessar Agendamentos
              </button>
            </div>
          </div>

          {/* Coluna da direita: Posts */}
          <div className="col-md-7">
            <h5>Criar novo post</h5>
            <div className="mb-4 border p-3 rounded">
              <input
                placeholder="Título"
                className="mb-2 p-2 border rounded w-full"
                value={tituloPost}
                onChange={(e) => setTituloPost(e.target.value)}
                disabled={loadingPost}
              />
              <br></br>
              <textarea
                placeholder="Conteúdo"
                className="mb-2 p-2 border rounded w-full"
                rows={3}
                value={conteudoPost}
                onChange={(e) => setConteudoPost(e.target.value)}
                disabled={loadingPost}
              ></textarea><br></br>
              <button
                className="btn btn-primary"
                onClick={handlePostar}
                disabled={loadingPost}
              >
                {loadingPost ? "Postando..." : "Postar"}
              </button>
              {mensagemPost && (
                <p className="mt-2 text-success">{mensagemPost}</p>
              )}
            </div>
            <h5>Seus Posts Recentes</h5>
            {meusPosts.length === 0 ? (
              <p>Você ainda não postou nenhuma dúvida.</p>
            ) : (
              <ul className="list-group">
                {meusPosts.map((post) => (
                  <li key={post._id} className="list-group-item mb-3">
                    <strong>{post.titulo}</strong>
                    <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>
                      {post.conteudo}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

export default PainelAluno;
