import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import "../styles/PostListar.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import Chat from "./chat/Chat";

export default function Forum() {
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filtroTitulo] = useState("");
  const [respostas, setRespostas] = useState({});
  const token = localStorage.getItem("token");
  const [monitores, setMonitores] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [respostasVisiveis, setRespostasVisiveis] = useState({});

  const navigate = useNavigate();
  const usuarioId = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get("/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(data.usuario);
        setFotoPerfil(
          data.usuario.fotoPerfil
            ? `https://fatecconnect-backend.onrender.com${data.usuario.fotoPerfil}`
            : "/images/usuario_padrao.png"
        );
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  const usuarioCurtiu = (post) => {
    return post.likes?.includes(usuarioId);
  };

  useEffect(() => {
    const fetchMonitores = async () => {
      try {
        const res = await api.get("/monitores");
        const monitoresCompletos = res.data.monitores.map((monitor) => ({
          ...monitor,
          curso: monitor.curso?.nome || { nome: "Curso não informado" },
          foto: monitor.fotoPerfil || "/images/usuario_padrao.png",
        }));
        setMonitores(monitoresCompletos || []);
      } catch (error) {
        console.error("Erro ao buscar monitores:", error);
      }
    };

    fetchMonitores();
  }, []);

  const buscarPosts = useCallback(async () => {
    try {
      const response = await api.get("/posts", {
        params: filtroTitulo ? { titulo: filtroTitulo } : {},
      });
      const postsCompletos = response.data.map((post) => ({
        ...post,
        autor: {
          ...post.autor,
          fotoPerfil: post.autor?.fotoPerfil
            ? `https://fatecconnect-backend.onrender.com${post.autor.fotoPerfil}`
            : "/images/usuario_padrao.png",
        },
      }));
      setPosts(postsCompletos);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
    }
  }, [filtroTitulo]);

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

  const postar = async () => {
    if (!titulo) {
      alert("Preencha o campo");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/postar",
        { titulo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitulo("");
      setMensagem("Post criado com sucesso!");
      buscarPosts();
    } catch (err) {
      console.error("Erro ao postar:", err);
      setMensagem("Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  const enviarResposta = async (postId) => {
    try {
      const conteudo = respostas[postId];
      if (!conteudo) return;

      await api.post(
        `/posts/${postId}/responder`,
        { conteudo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRespostas((prev) => ({ ...prev, [postId]: "" }));
      buscarPosts();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  const curtirPost = async (postId) => {
    try {
      await api.post(
        `/posts/${postId}/curtir`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      buscarPosts(); // atualiza likes
    } catch (err) {
      console.error("Erro ao curtir post:", err);
    }
  };

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

  return (
    <div>
      <Navbar />
      <SubNavbar />
      <br />
      <div className="max-w-4xl mx-auto p-6 space-y-12">
        {/* Monitores disponíveis */}
        <section className="relative">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Conheça nossos Monitores
          </h3>

          <div className="swiper-navigation-custom">
            <button className="swiper-button-prev-custom">
              <img src="/images/seta-direita.png" alt="Anterior" />
            </button>
            <button className="swiper-button-next-custom">
              <img src="/images/seta-esquerda.png" alt="Próximo" />
            </button>
          </div>

          {monitores.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum monitor encontrado.
            </p>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView="auto"
              centeredSlides={true}
              loop={monitores.length >= 3}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              className="mySwiper"
            >
              {monitores.map((monitor) => (
                <SwiperSlide key={monitor._id}>
                  <div className="card-monitor">
                    <img
                      src={
                        monitor.fotoPerfil
                          ? `https://fatecconnect-backend.onrender.com${monitor.fotoPerfil}`
                          : "/images/usuario_padrao.png"
                      }
                      alt={monitor.nome}
                    />
                    <div className="monitor-info">
                      <h5 className="fw-semibold">{monitor.nome}</h5>
                      <p className="text-muted mb-2">
                        {monitor.curso?.nome || "Curso não informado"}
                      </p>
                    </div>
                    <div className="icon-actions">
                      <img
                        src="/images/chat-monitor.png"
                        alt="Chat"
                        title="Conversar"
                        onClick={() => navigate(`/chat/${monitor._id}`)}
                      />
                      <img
                        src="/images/agenda-monitor.png"
                        alt="Agendar"
                        title="Agendar"
                        onClick={() =>
                          navigate(`/agendar-monitoria/${monitor._id}`)
                        }
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        <Chat />
        {/* Formulário para criar novo post */}
        <hr className="container my-5" />

        <section className="container my-5" style={{ maxWidth: 920 }}>
          <div className="d-flex align-items-center gap-3 p-3 border rounded shadow-sm bg-white">
            <img
              src={fotoPerfil || "/images/usuario_padrao.png"}
              alt="Foto do autor"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div className="flex-grow-1">
              <input
                type="text"
                className="custom-input form-control"
                placeholder="No que você está pensando?"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={loading}
                style={{ borderRadius: 20, padding: "20px 20px" }}
              />
            </div>

            <div>
              <img
                src="/images/enviado.png"
                alt="Enviar"
                onClick={loading ? undefined : postar}
                style={{
                  width: 36,
                  height: 36,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              />
            </div>
          </div>
        </section>
        {/* Lista de posts */}
        <section className="container my-5" style={{ maxWidth: 920 }}>
          <h2 className="text-center mb-5" style={{ fontSize: "2rem" }}>
            Posts Recentes
          </h2>

          {posts.length === 0 ? (
            <p className="text-center text-muted fst-italic">
              Nenhum post encontrado.
            </p>
          ) : (
            posts.map((post) => {
              const mostrarRespostas = respostasVisiveis[post._id];

              return (
                <div key={post._id} className="card mb-4 shadow-sm">
                  <div className="card-body">
                    {/* Header com imagem + nome */}
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={
                          post.autor?.fotoPerfil || "/images/usuario_padrao.png"
                        }
                        alt="Foto do autor"
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "1.1rem", marginLeft: "10px" }}
                      >
                        {post.autor?.nome || "Desconhecido"}
                      </span>
                    </div>

                    {/* Conteúdo do post */}
                    <h3
                      className="card-title fw-medizzzz"
                      style={{ fontSize: "1.4rem" }}
                    >
                      {post.titulo}
                    </h3>

                    {/* Botões Curtir e Comentar */}

                    <div className="d-flex justify-content-start gap-3 mb-2 px-2">
                      <small className="text-muted">
                        {post.likes?.length || 0} curtidas
                      </small>
                      <small className="text-muted">
                        {post.respostas?.length || 0} comentário(s)
                      </small>
                    </div>

                    {/* Botões Curtir e Comentar centralizados horizontalmente */}
                    <div className="d-flex justify-content-center gap-2 mt-auto">
                      <button
                        onClick={() => curtirPost(post._id)}
                        className={`btn btn-like flex-fill ${
                          usuarioCurtiu(post) ? "curtido" : ""
                        }`}
                        style={{
                          maxWidth: "500px",
                          border: "1px solid rgb(200, 197, 197)",
                          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        ❤️ Curtir
                      </button>

                      <button
                        className="btn btn-comment flex-fill"
                        style={{
                          maxWidth: "500px",
                          border: "1px solid rgb(200, 197, 197)",
                          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                        }}
                        onClick={() =>
                          setRespostasVisiveis((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id],
                          }))
                        }
                      >
                        💬 Comentar
                      </button>
                    </div>

                    <br />
                    {/* Comentários e respostas */}
                    {mostrarRespostas && (
                      <>
                        <div className="d-flex align-items-end gap-2 mb-3">
                          <textarea
                            value={respostas[post._id] || ""}
                            onChange={(e) =>
                              setRespostas((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }))
                            }
                            placeholder="Escreva uma resposta..."
                            className="form-control"
                            rows={2}
                            style={{ resize: "none" }}
                            disabled={loading}
                          />
                          <img
                            src="/images/enviado.png"
                            alt="Enviar resposta"
                            onClick={() => {
                              if (!loading && respostas[post._id]?.trim())
                                enviarResposta(post._id);
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              cursor:
                                loading || !respostas[post._id]?.trim()
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                loading || !respostas[post._id]?.trim()
                                  ? 0.5
                                  : 1,
                              alignSelf: "center",
                            }}
                            title="Enviar resposta"
                          />
                        </div>

                        {/* Respostas visíveis */}
                        {post.respostas?.length > 0 ? (
                          <div className="border-start border-3 ps-3 border-danger">
                            {post.respostas.map((resp, i) => (
                              <div key={i} className="mb-2">
                                <strong>
                                  {resp.autor?.nome || "Anônimo"}:{" "}
                                </strong>
                                <span>{resp.conteudo}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted fst-italic ps-2">
                            Sem respostas ainda.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
