import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CadastroVaga() {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    curso: ""
  });

  const [imagem, setImagem] = useState(null);

  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:5000/api/cadastrovagas", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        alert("Erro: " + (data.mensagem || "Erro ao cadastrar vaga"));
        return;
      }

      navigate("/vagas");
    } catch (error) {
      alert("Erro na requisição: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastrar Vaga</h2>
      <input
        type="file"
        name="imagem"
        accept="image/*"
        onChange={handleImageChange}
        required
      />
      <input
        name="titulo"
        placeholder="Título"
        onChange={handleChange}
        required
      />
      <textarea
        name="descricao"
        placeholder="Descrição"
        onChange={handleChange}
        required
      />
      <input
        name="curso"
        placeholder="Curso"
        onChange={handleChange}
        required
      />
      <button type="submit">Cadastrar</button>
    </form>
  );
}

export default CadastroVaga;
