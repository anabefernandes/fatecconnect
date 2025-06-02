import { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import { FaCalendarAlt } from "react-icons/fa";
import Navbar from "./Navbar";
import SubNavbar from "./SubNavbar";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AgendarMonitoria.css";

registerLocale("pt-BR", ptBR);
// ... (imports permanecem iguais)

export default function AgendarMonitoria() {
  const user = JSON.parse(localStorage.getItem("user"));
  const alunoId = user?._id || user?.id;

  const [monitores, setMonitores] = useState([]);
  const [monitorId, setMonitorId] = useState("");
  const [data, setData] = useState(new Date());
  const [mensagemErro, setMensagemErro] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState("todos");

  useEffect(() => {
    const buscarMonitores = async () => {
      try {
        const res = await api.get("/monitores");
        setMonitores(res.data.monitores || []);
      } catch (err) {
        setMensagemErro("Erro ao carregar monitores.");
      }
    };

    buscarMonitores();
  }, []);

  const agendar = async () => {
    if (!alunoId || !monitorId || !data) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const res = await api.post("/agendar-monitoria", {
        alunoId,
        monitorId,
        data: new Date(data),
      });
      alert(res.data.mensagem || "Agendamento realizado!");
    } catch (err) {
      alert(
        "Erro ao agendar: " +
        (err.response?.data?.mensagem || "Erro desconhecido")
      );
    }
  };

  const diasSemana = [
    { label: "Todos", value: "todos" },
    { label: "Segunda", value: 1 },
    { label: "Terça", value: 2 },
    { label: "Quarta", value: 3 },
    { label: "Quinta", value: 4 },
    { label: "Sexta", value: 5 },
  ];

  const filtrarPorDia = (date) => {
    if (diaSelecionado === "todos") return true;
    return date.getDay() === diaSelecionado;
  };

  return (
    <>
      <Navbar />
      <SubNavbar />

      <div className="container-fluid fundo-agendamento">

        {mensagemErro && (
          <div className="alert alert-danger text-center">
            {mensagemErro}
          </div>
        )}

        <div className="row">
          {/* COLUNA ESQUERDA - Monitor e Filtro */}
          <div className="col-md-6 p-5 coluna-esquerda text-white">
            <h3 className="text-center mb-3">Monitores Disponíveis</h3>
            <select
              className="form-select mb-5"
              value={monitorId}
              onChange={(e) => setMonitorId(e.target.value)}
            >
              <option value="">Selecione um monitor</option>
              {monitores.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.nome}
                </option>
              ))}
            </select>

            <h5 className="fw">Filtrar por dia:</h5>
            <select
              className="form-select mb-2"
              value={diaSelecionado}
              onChange={(e) =>
                setDiaSelecionado(
                  e.target.value === "todos"
                    ? "todos"
                    : parseInt(e.target.value)
                )
              }
            >
              {diasSemana.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* COLUNA DIREITA - Calendário e Botão */}
          <div className="col-md-6 d-flex flex-column align-items-center justify-content-start coluna-direita">
            <label className="label-grande mb-3">
              <FaCalendarAlt className="icone" />
              Data e Hora
            </label>
            <div className="custom-datepicker-wrapper">
              <DatePicker
                selected={data}
                onChange={(date) => setData(date)}
                showTimeSelect
                locale="pt-BR"
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="Horário"
                dateFormat="dd/MM/yyyy HH:mm"
                className="form-control mb-4"
                filterDate={filtrarPorDia}
                inline
              />
            </div>
            <button
              onClick={agendar}
              className="btn btn-danger botao-agendar btn-lg px-5 py-2 mt-5"
            >
              Agendar
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
