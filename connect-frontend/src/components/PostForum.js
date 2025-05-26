import React, { useState } from "react";
import axios from "axios";

export default function PostForum() {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false); // controle de loading
  const [mensagem, setMensagem] = useState(null); // feedback para o usuário

  const token = localStorage.getItem("token");

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
    } catch (err) {
      console.error("Erro ao postar:", err);
      setMensagem("Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fórum</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Criar novo post</h2>
        <input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
          disabled={loading}
        />
        <textarea
          placeholder="Conteúdo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
          rows={4}
          disabled={loading}
        />
        <button
          onClick={postar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Postando..." : "Postar"}
        </button>

        {mensagem && (
          <p className="mt-4 text-center text-sm text-green-600">{mensagem}</p>
        )}
      </div>
    </div>
  );
}
