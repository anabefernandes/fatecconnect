import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function PostListar() {
  const [posts, setPosts] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [respostas, setRespostas] = useState({});
  //const [token] = useState("");
const [token] = useState(() => localStorage.getItem("token") || "");


  const buscarPosts = useCallback(async () => {
    try {
      const response = await axios.get("https://fatecconnect-backend.onrender.com/api/posts", {
        params: filtroTitulo ? { titulo: filtroTitulo } : {},
      });
      setPosts(response.data);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
    }
  }, [filtroTitulo]);

  const enviarResposta = async (postId) => {
    try {
      const conteudo = respostas[postId];
      if (!conteudo) return;

      await axios.post(
        `https://fatecconnect-backend.onrender.com/api/posts/${postId}/responder`,
        { conteudo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRespostas((prev) => ({ ...prev, [postId]: "" }));
      buscarPosts(); // Atualiza após responder
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fórum - Listagem de Posts</h1>

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
                      <span className="font-medium">{resp.autor?.nome || "Anônimo"}:</span>{" "}
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
                  setRespostas((prev) => ({ ...prev, [post._id]: e.target.value }))
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
  );
}
