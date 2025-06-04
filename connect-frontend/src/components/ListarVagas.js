import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import "../styles/ListarVagas.css";

function ListarVagas() {

  const [vagas, setVagas] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    curso: "",
  });
  const [imagem, setImagem] = useState(null);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImagem(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagem) {
      alert("Envie uma imagem!");
      return;
    }

    const formData = new FormData();
    formData.append("imagem", imagem);
    formData.append("titulo", form.titulo);
    formData.append("descricao", form.descricao);
    formData.append("curso", form.curso);

    try {
      const response = await fetch(
        "https://fatecconnect-backend.onrender.com/api/cadastrovagas",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert("Erro: " + (data.mensagem || "Erro ao cadastrar vaga"));
        return;
      }

      setForm({ titulo: "", descricao: "", curso: "" });
      setImagem(null);

      buscarVagas(cursoFiltro);
    } catch (error) {
      alert("Erro na requisição: " + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <SubNavbar />

      <div className="container my-5" style={{ maxWidth: 1100 }}>
        <h2 className="mb-4 text-center">Cadastrar Vaga</h2>
        <form onSubmit={handleSubmit}>
          <div
            className="p-3 border rounded shadow-sm bg-white"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "1rem 1.5rem",
              alignItems: "start",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label
                htmlFor="imagem"
                className="form-label d-block"
                style={{ fontWeight: "600" }}
              >
                Imagem
              </label>
              <input
                type="file"
                className="form-control custom-input"
                id="imagem"
                name="imagem"
                accept="image/*"
                onChange={handleImageChange}
                required
                style={{ borderRadius: 20 }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label
                htmlFor="titulo"
                className="form-label custom-input"
                style={{ fontWeight: "600" }}
              >
                Título
              </label>
              <input
                type="text"
                className="form-control custom-input"
                id="titulo"
                name="titulo"
                placeholder="Título"
                onChange={handleChange}
                required
                style={{ borderRadius: 20, padding: "12px 15px" }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label
                htmlFor="curso"
                className="form-label custom-input"
                style={{ fontWeight: "600" }}
              >
                Curso
              </label>
              <input
                type="text"
                className="form-control custom-input"
                id="curso"
                name="curso"
                placeholder="Curso"
                onChange={handleChange}
                required
                style={{ borderRadius: 20, padding: "12px 15px" }}
              />
            </div>

            <div style={{ gridColumn: "span 5" }}>
              <label
                htmlFor="descricao"
                className="form-label custom-input"
                style={{ fontWeight: "600" }}
              >
                Descrição
              </label>
              <textarea
                className="form-control"
                id="descricao"
                name="descricao"
                placeholder="Descrição"
                rows="3"
                onChange={handleChange}
                required
                style={{ borderRadius: 20, padding: "12px 15px", resize: "none" }}
              ></textarea>
            </div>
            <div
              style={{
                gridColumn: "6 / 7",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end", 
              }}
            >
              <button
                type="submit"
                className="btn btn-danger"
                style={{
                  borderRadius: "50%",
                  width: 65,
                  height: 65,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  fontSize: "1.3rem",
                  marginTop: "3rem",
                }}
                title="Cadastrar"
              >
                <img
                  src="/images/enviado.png"
                  alt="Enviar"
                  style={{ width: 32, height: 32 }}
                />
              </button>
            </div>
          </div>
        </form>


        {/* Seção de vagas */}
        <hr className="my-5" />

        <div className="d-flex justify-content-between align-items-center mb-4 header-vagas">
          <h2 className="text-center">Vagas Disponíveis</h2>
          <input
            type="text"
            className="form-control-curso custom-input w-25"
            placeholder="Filtrar por curso"
            value={cursoFiltro}
            onChange={handleFiltro}
          />
        </div>

        <div className="row">
          {vagas.length === 0 && (
            <p className="text-center text-muted">Nenhuma vaga encontrada.</p>
          )}

          {vagas.map((vaga) => (
            <div key={vaga._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={`https://fatecconnect-backend.onrender.com/uploads/${vaga.imagem}`}
                  alt={vaga.titulo}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-danger">{vaga.titulo}</h5>
                  <p className="card-text flex-grow-1">{vaga.descricao}</p>
                  <p className="text-muted mb-0">
                    <strong>Curso:</strong> {vaga.curso}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ListarVagas;
