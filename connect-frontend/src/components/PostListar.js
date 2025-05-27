import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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
      buscarPosts(); // atualiza lista
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

      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Fórum</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Monitores Disponíveis</h2>
          <div className="flex flex-wrap gap-4">
            {monitores.length === 0 && <p>Nenhum monitor encontrado.</p>}
            {monitores.map((monitor) => (
              <div
                key={monitor._id}
                className="border rounded p-4 shadow w-48 flex flex-col items-center"
              >
                <img
                  src={
                    monitor.foto
                      ? `https://fatecconnect-backend.onrender.com${monitor.foto}`
                      : "../../public/images/usuario-padrao.png"
                  }
                  alt={monitor.nome}
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
                <h3 className="font-semibold">{monitor.nome}</h3>
                <p className="text-sm text-gray-600">
                  {monitor.curso?.nome || "Curso não informado"}
                </p>
                <button
                  onClick={() => navigate(`/agendar/${monitor._id}`)}
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de novo post */}
        <div className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Criar novo post</h2>
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
            disabled={loading}
          />
          <br></br>
          <textarea
            placeholder="Conteúdo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
            rows={2}
            disabled={loading}
          />
          <br></br>
          <button
            onClick={postar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Postando..." : "Postar"}
          </button>
          {mensagem && (
            <p className="mt-4 text-center text-sm text-green-600">
              {mensagem}
            </p>
          )}
        </div>

        {/* Filtro */}
        <div className="mb-6">
          <input
            placeholder="Filtrar por título"
            value={filtroTitulo}
            onChange={(e) => setFiltroTitulo(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
          />
          <button
            onClick={buscarPosts}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Buscar
          </button>
        </div>

        {/* Lista de posts */}
        <div className="space-y-6">
          {posts.length === 0 && <p>Nenhum post encontrado.</p>}
          {posts.map((post) => (
            <div key={post._id} className="border rounded p-4 shadow">
              <h3 className="text-lg font-semibold">{post.titulo}</h3>
              <p className="text-sm text-gray-600">
                por {post.autor?.nome || "Desconhecido"}
              </p>
              <p className="mt-2">{post.conteudo}</p>

              {/* Respostas */}
              <div className="mt-4 ml-4 border-l pl-4">
                <h4 className="font-semibold mb-2">Respostas:</h4>
                {post.respostas?.length > 0 ? (
                  post.respostas.map((resp, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm">
                        <span className="font-medium">
                          {resp.autor?.nome || "Anônimo"}:
                        </span>{" "}
                        {resp.conteudo}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sem respostas ainda.</p>
                )}
              </div>

              {/* Campo para nova resposta */}
              <div className="mt-4">
                <textarea
                  value={respostas[post._id] || ""}
                  onChange={(e) =>
                    setRespostas((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  placeholder="Escreva uma resposta..."
                  className="w-full border rounded p-2"
                />
                <button
                  onClick={() => enviarResposta(post._id)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
