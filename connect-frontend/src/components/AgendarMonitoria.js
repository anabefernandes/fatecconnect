import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";

export default function AgendarMonitoria() {
  const user = JSON.parse(localStorage.getItem("user"));
  const alunoId = user?._id || user?.id;

  const [monitores, setMonitores] = useState([]);
  const [monitorId, setMonitorId] = useState("");
  const [data, setData] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

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

  if (!user || !user.nome || !user.email || !user.ra || !user.curso) {
    return (
      <div className="p-4 max-w-md mx-auto bg-red-100 border border-red-400 rounded">
        <p>
          Dados incompletos no seu perfil. Por favor, complete seu cadastro
          antes de agendar uma monitoria.
        </p>
      </div>
    );
  }

  const agendar = async () => {
    console.log({ alunoId, monitorId, data });

    if (!alunoId || !monitorId || !data) {
      alert("Preencha todos os campos antes de agendar.");
      return;
    }

    try {
      const res = await api.post("/agendar-monitoria", {
        alunoId,
        monitorId,
        data: new Date(data),
      });
      alert(res.data.mensagem || "Agendamento realizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert(
        "Erro ao agendar: " +
          (err.response?.data?.mensagem || "Erro desconhecido")
      );
    }
  };

  return (
    <div>
      <Navbar />
      <SubNavbar />
      <h2 className="text-xl font-bold mb-2">Agendar Monitoria</h2>

      {mensagemErro && (
        <div className="mb-2 text-red-600 font-semibold">{mensagemErro}</div>
      )}

      <label className="block mb-2">
        Monitor:
        <select
          className="w-full border p-2"
          value={monitorId}
          onChange={(e) => setMonitorId(e.target.value)}
        >
          <option value="">Selecione</option>
          {monitores.map((m) => (
            <option key={m._id} value={m._id}>
              {m.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Data e Hora:
        <input
          type="datetime-local"
          className="w-full border p-2"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </label>

      <button
        onClick={agendar}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Agendar
      </button>
    </div>
  );
}
