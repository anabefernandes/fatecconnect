import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../styles/PainelAluno.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import api from "../services/api";
import "../styles/variables/Colors.css";
import ListarAgendamentosAluno from "../components/ListarAgendamentosAluno";

const PainelAluno = () => {
  const navigate = useNavigate();

  const [tituloPost, setTituloPost] = useState("");
  //const [conteudoPost, setConteudoPost] = useState("");
  const postInputRef = useRef(null);

  const [loadingPost, setLoadingPost] = useState(false);
  const [mensagemPost, setMensagemPost] = useState(null);
  const [editando, setEditando] = useState(false);
  const [postEditandoId, setPostEditandoId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  const [showBioModal, setShowBioModal] = useState(false);
  const [biografia, setBiografia] = useState("");
  const [novaBiografia, setNovaBiografia] = useState("");

  const [meusPosts, setMeusPosts] = useState([]);

  const mostrarMensagemTemporaria = (msg, duracao = 3000) => {
    setMensagemPost(msg);
    setTimeout(() => {
      setMensagemPost(null);
    }, duracao);
  };

  const editarPost = (postId) => {
    const postSelecionado = meusPosts.find((p) => p._id === postId);
    if (postSelecionado) {
      setTituloPost(postSelecionado.titulo);
      setPostEditandoId(postId);
      setEditando(true);

      postInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const excluirPost = async (postId) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await api.delete(`/posts/${postId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setMeusPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        alert("Post excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir post:", error);
        alert("Erro ao excluir o post.");
      }
    }
  };

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
    if (!tituloPost.trim()) {
      alert("Preencha todos os campos para postar.");
      return;
    }

    setLoadingPost(true);

    try {
      if (editando) {
        await api.put(
          `/posts/${postEditandoId}`,
          { titulo: tituloPost },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        mostrarMensagemTemporaria("Post editado com sucesso!");
      } else {
        await api.post(
          "/postar",
          { titulo: tituloPost },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        mostrarMensagemTemporaria("Post criado com sucesso!");
      }

      setTituloPost("");
      setEditando(false);
      setPostEditandoId(null);

      const { data } = await api.get("/meus-posts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMeusPosts(data);
    } catch (error) {
      console.error("Erro ao postar:", error);
      mostrarMensagemTemporaria("Erro ao salvar post");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleSalvarBiografia = async () => {
    if (!novaBiografia.trim()) {
      alert("A biografia não pode estar vazia.");
      return;
    }

    if (novaBiografia.length > 500) {
      alert("A biografia não pode ter mais que 500 caracteres.");
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

      <div className="container painel-content p-4">
        <h4 className="mb-5">Painel do Aluno</h4>
        <div className="row ">
          {/* Coluna esquerda - Perfil e ações */}
          <div className="col-md-5">
            <div style={{ position: "sticky", top: "20px" }}>
              <div className="d-flex align-items gap-3 mb-3">
                <Link to="/forum" className="btn btn-sm p-0 m-0 ">
                  <img
                    src="/images/voltar-red.png"
                    alt="Voltar para o início"
                    style={{ width: "22px", height: "22px" }}
                  />
                </Link>

                <div className="position-relative d-inline-block">
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
                  <img
                    src="/images/edite-sua-foto.png"
                    alt="Editar Foto"
                    onClick={() => setShowModal(true)}
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      padding: "4px",
                    }}
                  />
                </div>
                <h5 className="mb-0 fw-bold mt-3">
                  {usuario?.nome || "Aluno"}
                </h5>
              </div>

              <div
                className="mt-4 mb-4 p-3 rounded"
                style={{
                  backgroundColor: "#f0f0f0",
                  maxHeight: "350px",
                  height: "300px",
                  position: "relative",
                }}
              >
                <div className="mb-3" style={{ position: "relative" }}>
                  <h5 className="text-center mb-0">Biografia</h5>
                  <img
                    src="/images/editar.png"
                    alt="Editar"
                    onClick={() => {
                      setNovaBiografia(biografia);
                      setShowBioModal(true);
                    }}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      position: "absolute",
                      top: "0px",
                      right: "0px",
                    }}
                    title="Editar biografia"
                  />
                </div>
                <p style={{ whiteSpace: "pre-wrap", fontSize: "1.05rem" }}>
                  {biografia || "Nenhuma biografia cadastrada."}
                </p>
              </div>
              <ListarAgendamentosAluno
                limite={3}
                comNavs={false}
                mostrarCancelados={false}
              />
            </div>
          </div>

          {/* Coluna direita - Posts */}
          <div className="col-md-7 mt-md-0 mt-4">
            <h5 className="text-center mb-3">Criar novo post</h5>
            <div ref={postInputRef} className="mb-4 border p-3 rounded">
              {editando && (
                <div
                  className="d-flex justify-content-between align-items-center mb-2"
                  style={{ userSelect: "none" }}
                >
                  <small className="text-black fw-bold">Editando post...</small>
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(false);
                      setPostEditandoId(null);
                      setTituloPost("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label="Cancelar edição"
                    title="Cancelar edição"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4.646 4.646a.5.5 0 011 0L8 6.293l2.354-2.647a.5.5 0 11.707.708L8.707 7l2.647 2.354a.5.5 0 11-.708.707L8 7.707l-2.354 2.647a.5.5 0 01-.707-.708L7.293 7 4.646 4.646z" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="d-flex align-items-center gap-2">
                <img
                  src={fotoUrl || "/images/usuario_padrao.png"}
                  alt="Foto do autor"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <textarea
                  placeholder="O que você gostaria de compartilhar?"
                  className="form-control"
                  rows={2}
                  value={tituloPost}
                  onChange={(e) => setTituloPost(e.target.value)}
                  disabled={loadingPost}
                  style={{ resize: "none", overflowY: "auto" }}
                ></textarea>
                <img
                  src="/images/enviado.png"
                  alt="Postar"
                  onClick={handlePostar}
                  className="botao-enviar"
                  style={{
                    width: 36,
                    height: 36,
                    cursor: loadingPost ? "not-allowed" : "pointer",
                    opacity: loadingPost ? 0.5 : 1,
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1.0)")
                  }
                />
              </div>
              {mensagemPost && (
                <p className="mt-2 text-success text-end">{mensagemPost}</p>
              )}
            </div>

            {meusPosts.map((post) => (
              <div
                key={post._id}
                className="card mb-3 shadow-sm position-relative"
                style={{ borderLeft: "4px solid var(--red-dead)" }}
              >
                <div
                  className="position-absolute"
                  style={{
                    top: "10px",
                    right: "10px",
                    zIndex: 1,
                  }}
                >
                  <button
                    className="btn btn-sm me-2"
                    style={{
                      backgroundColor: "var(--red-light)",
                      color: "#fff",
                    }}
                    onClick={() => editarPost(post._id)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "var(--red-dark)",
                      color: "#fff",
                    }}
                    onClick={() => excluirPost(post._id)}
                  >
                    Excluir
                  </button>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={fotoUrl || "/images/usuario_padrao.png"}
                      alt="Foto do autor"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "10px",
                      }}
                    />
                    <strong className="text-dark">
                      {post.autor?.nome || "Aluno"}
                    </strong>
                  </div>

                  <p
                    className="card-text text-dark"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {post.titulo.length > 150
                      ? post.titulo.substring(0, 150) + "..."
                      : post.titulo}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {post.createdAt &&
                        new Date(post.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <span className="ms-2">(editado)</span>
                      )}
                    </small>
                  </div>
                </div>
              </div>
            ))}
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
                  className="btn"
                  style={{
                    backgroundColor: "var(--red-light)",
                    color: "#fff",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  {" "}
                  Cancelar
                </button>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "var(--red-dark)",
                    color: "#fff",
                  }}
                  onClick={handleUpload}
                >
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
                  style={{
                    height: "100px",
                    resize: "none",
                  }}
                  value={novaBiografia}
                  onChange={(e) => setNovaBiografia(e.target.value)}
                  maxLength={500}
                />
                <small className="text-muted">
                  {novaBiografia.length}/ 500 caracteres
                </small>
              </div>

              <div className="modal-footer">
                <button
                  className="btn"
                  style={{ backgroundColor: "var(--red-light)", color: "#fff" }}
                  onClick={() => setShowBioModal(false)}
                >
                  {" "}
                  Cancelar
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: "var(--red-dark)", color: "#fff" }}
                  onClick={handleSalvarBiografia}
                >
                  {" "}
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
