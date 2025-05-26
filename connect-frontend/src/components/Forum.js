import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const Forum = () => {
  const [postagens, setPostagens] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursos, setCursos] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchDados = async () => {
      try {
        // Buscar cursos
        const resCursos = await fetch("http://localhost:5000/api/cursos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cursosData = await resCursos.json();
        setCursos(cursosData);

        // Buscar postagens
        const resPosts = await fetch("http://localhost:5000/api/postagens", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await resPosts.json();
        setPostagens(postsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
  }, [token, navigate]);

  const handlePostar = async () => {
    if (!titulo || !texto || !cursoId) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/postagens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, texto, curso: cursoId }),
      });

      if (res.ok) {
        const novaPostagem = await res.json();
        setPostagens([novaPostagem, ...postagens]); // adiciona no topo
        setTitulo("");
        setTexto("");
        setCursoId("");
      } else {
        alert("Erro ao postar.");
      }
    } catch (error) {
      console.error("Erro ao postar:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>Fórum de Discussões</h2>

        {/* Formulário de Postagem */}
        <div className="card p-3 mb-4">
          <h5>Criar nova postagem</h5>
          <textarea
            className="form-control mb-2"
            placeholder="Titulo"
            rows="1"
            value={texto}
            onChange={(e) => setTitulo(e.target.value)}
          ></textarea>
          <textarea
            className="form-control mb-2"
            placeholder="Digite sua mensagem"
            rows="4"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          ></textarea>
          <select
            className="form-select mb-2"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
          >
            <option value="">Selecione o curso</option>
            {cursos.map((curso) => (
              <option key={curso._id} value={curso._id}>
                {curso.nome}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handlePostar}>
            Postar
          </button>
        </div>

        {/* Lista de Postagens */}
        <div className="list-group">
          {postagens.map((post) => (
            <div key={post._id} className="list-group-item">
              <h5>{post.titulo}</h5>
              <p>{post.texto}</p>
              <small className="text-muted">
                Curso: {post.curso?.nome || "N/A"}
              </small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Forum;
