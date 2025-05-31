import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/PostListar.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

export default function Forum() {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [respostas, setRespostas] = useState({});
  const token = localStorage.getItem("token");
  const [monitores, setMonitores] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonitores = async () => {
      try {
        const res = await api.get("/monitores");
        setMonitores(res.data.monitores || []);
      } catch (error) {
        console.error("Erro ao buscar monitores:", error);
      }
    };

    fetchMonitores();
  }, []);

  const buscarPosts = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://fatecconnect-backend.onrender.com/api/posts",
        {
          params: filtroTitulo ? { titulo: filtroTitulo } : {},
        }
      );
      setPosts(response.data);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
    }
  }, [filtroTitulo]);

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

  const postar = async () => {
    if (!titulo || !conteudo) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "https://fatecconnect-backend.onrender.com/api/postar",
        { titulo, conteudo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitulo("");
      setConteudo("");
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

      await axios.post(
        `https://fatecconnect-backend.onrender.com/api/posts/${postId}/responder`,
        { conteudo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRespostas((prev) => ({ ...prev, [postId]: "" }));
      buscarPosts();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <SubNavbar />
      <br />
      <div className="max-w-4xl mx-auto p-6 space-y-12">
        {/* Monitores disponíveis */}
        <section className="relative">
          <h3 className="text-2xl font-semibold mb-4 text-center">Conheça nossos Monitores</h3>

          <div className="swiper-navigation-custom">
            <button className="swiper-button-prev-custom">
              <img src="/images/seta-direita.png" alt="Anterior" />
            </button>
            <button className="swiper-button-next-custom">
              <img src="/images/seta-esquerda.png" alt="Próximo" />
            </button>
          </div>

          {monitores.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum monitor encontrado.</p>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={2}
              centeredSlides
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
                        monitor.foto
                          ? `https://fatecconnect-backend.onrender.com${monitor.foto}`
                          : "/images/usuario-padrao.png"
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
                        onClick={() => navigate(`/agendar/${monitor._id}`)}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>


        {/* Formulário para criar novo post */}
        <hr className="container my-5" />

        <section className="mx-auto" style={{ maxWidth: 900 }}>
          {/*<h3 className="text-center mb-4">Criar novo post</h3>*/}
          <div className="p-4 rounded shadow-sm border bg-white">
            <div className="mb-3">
              <input
                type="text"
                className="custom-input form-control"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <textarea
                className="custom-input form-control"
                rows={3}
                placeholder="O que você gostaria de compartilhar?"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                disabled={loading}
                style={{ resize: "none", overflowY: "auto" }}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end align-items-center gap-3">
              {mensagem && <p className="text-success mb-0">{mensagem}</p>}
              <img
                src="/images/enviado.png"
                alt="Postar"
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

        <section className="container my-5" style={{ maxWidth: 920 }}>
          <h2 className="text-center mb-5" style={{ fontSize: '2rem' }}>Posts Recentes</h2>

          {posts.length === 0 ? (
            <p className="text-center text-muted fst-italic">Nenhum post encontrado.</p>
          ) : (
            <div>
              {posts.map((post) => (
                <div key={post._id} className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={
                          post.autor?.foto
                            ? `https://fatecconnect-backend.onrender.com${post.autor.foto}`
                            : "/images/usuario-padrao.png"
                        }
                        alt={post.autor?.nome || "Usuário"}
                        className="rounded-circle me-3"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                      <span className="fw-semibold" style={{ fontSize: '1.1rem' }}>
                        {post.autor?.nome || "Desconhecido"}
                      </span>
                    </div>

                    <h3 className="card-title fw-bold" style={{ fontSize: '1.4rem' }}>
                      {post.titulo}
                    </h3>

                    <p className="card-text mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                      {post.conteudo}
                    </p>

                    <div className="d-flex align-items-center mb-4 gap-2">
                      <textarea
                        value={respostas[post._id] || ""}
                        onChange={(e) =>
                          setRespostas((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        placeholder="Escreva uma resposta..."
                        className="custom-input form-control"
                        rows={2}
                        style={{ resize: 'none' }}
                        disabled={loading}
                      />
                      <img
                        src="/images/enviado.png"
                        alt="Enviar resposta"
                        onClick={() => {
                          if (!loading && respostas[post._id]?.trim()) enviarResposta(post._id);
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          cursor: loading || !respostas[post._id]?.trim() ? "not-allowed" : "pointer",
                          opacity: loading || !respostas[post._id]?.trim() ? 0.5 : 1,
                        }}
                        title="Enviar resposta"
                      />
                    </div>

                    {/* Respostas */}
                    <div className="border-start border-4 border-danger ps-3">
                      <h5 className="fw-semibold mb-3">Respostas:</h5>
                      {post.respostas?.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {post.respostas.map((resp, i) => (
                            <li key={i} className="list-group-item px-0 py-1">
                              <span className="fw-semibold">{resp.autor?.nome || "Anônimo"}: </span>
                              <span>{resp.conteudo}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted fst-italic">Sem respostas ainda.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
