import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";

const AgendarMonitoria = () => {
  const [monitores, setMonitores] = useState([]);
  const [monitorSelecionado, setMonitorSelecionado] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const buscarMonitores = async () => {
      try {
        const res = await api.get("/monitores");
        setMonitores(res.data.monitores || []);
      } catch (err) {
        console.error("Erro ao buscar monitores:", err);
        setMensagemErro("Erro ao carregar monitores.");
      }
    };

    buscarMonitores();
  }, []);

  const handleSelectChange = (e) => {
    setMonitorSelecionado(e.target.value);
  };

  const handleDataHoraChange = (e) => {
    setDataHora(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensagemErro("");
    setSucesso(false);

    if (!monitorSelecionado || !dataHora) {
      setMensagemErro("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await api.post("/agendamentos", {
        monitorId: monitorSelecionado,
        dataHora: dataHora
      });

      setSucesso(true);
      setMensagemErro("");
      setMonitorSelecionado("");
      setDataHora("");
    } catch (err) {
      console.error("Erro ao agendar monitoria:", err);
      setMensagemErro("Erro ao agendar monitoria, tente novamente.");
    }
  };

  return (
    <div>
       <Navbar />
       <SubNavbar />
      <h2>Agendar Monitoria</h2>

      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}
      {sucesso && <p style={{ color: "green" }}>Agendamento realizado com sucesso!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="monitor">Selecione um Monitor:</label>
          <select
            id="monitor"
            value={monitorSelecionado}
            onChange={handleSelectChange}
          >
            <option value="">-- Selecione um monitor --</option>
            {monitores.map((monitor) => (
              <option key={monitor._id} value={monitor._id}>
                {monitor.nome} - {monitor.curso}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dataHora">Data e Hora do Encontro:</label>
          <input
            type="datetime-local"
            id="dataHora"
            value={dataHora}
            onChange={handleDataHoraChange}
            required
          />
        </div>

        <button type="submit">Agendar</button>
      </form>
    </div>
  );
};

export default AgendarMonitoria;
