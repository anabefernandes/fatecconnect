import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";

function ListarVagas() {
  const [vagas, setVagas] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState("");

  const buscarVagas = async (curso = "") => {
    let url = "https://fatecconnect-backend.onrender.com/api/vagas";
    if (curso) url += `?curso=${curso}`;
    const res = await fetch(url);
    const data = await res.json();
    setVagas(data);
  };

  useEffect(() => {
    buscarVagas();
  }, []);

  const handleFiltro = (e) => {
    const curso = e.target.value;
    setCursoFiltro(curso);
    buscarVagas(curso);
  };

  return (
    <div>
      <Navbar />
      <SubNavbar />
      <h2>Vagas Disponíveis</h2>
      <input
        placeholder="Filtrar por curso"
        value={cursoFiltro}
        onChange={handleFiltro}
      />
      <ul>
        {vagas.map((vaga) => (
          <li key={vaga._id}>
            {/* Ajuste aqui para mostrar a imagem */}
            <img
              src={`https://fatecconnect-backend.onrender.com/uploads/${vaga.imagem}`}
              alt={vaga.titulo}
              style={{ width: "200px", height: "auto", objectFit: "cover" }}
            />
            <br />
            <strong>{vaga.titulo}</strong>
            <br />
            {vaga.descricao}
            <br />
            Curso: {vaga.curso}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListarVagas;
