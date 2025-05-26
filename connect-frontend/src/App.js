import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { io } from "socket.io-client";

import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import CriarMonitor from "./components/CriarMonitor";
import PainelAdmin from "./components/PainelAdmin";
import ListarUsuarios from "./components/ListarUsuarios";
import EditarUsuario from "./components/EditarUsuario";
import PainelAluno from "./components/PainelAluno";
import PainelMonitor from "./components/PainelMonitor";
import RotaProtegida from "./components/RotaProtegida";
import TelaInicial from "./components/TelaInicial";
import Chat from "./components/chat/Chat";
import AgendarHorario from "./components/AgendarHorario";
import Agendamentos from "./components/Agendamentos";
import Forum from "./components/Forum";
import RedefinirSenha from "./components/RedefinicaoSenhaUnificada";
import SolicitarRedefinicao from "./components/RedefinicaoSenhaUnificada";

const LayoutComChat = ({ children, socket }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const rotasSemChat = ["/", "/login", "/cadastro"];

  return (
    <>
      {children}
      {!rotasSemChat.includes(location.pathname) && user && (
        <Chat socket={socket} user={user} />
      )}
    </>
  );
};

const App = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://fatecconnect-backend.onrender.com");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/solicitar-redefinicao"
          element={<SolicitarRedefinicao />}
        />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />

        <Route
          path="/criar-monitor"
          element={
            <RotaProtegida>
              <LayoutComChat socket={socket}>
                <CriarMonitor />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/agendar"
          element={
            <RotaProtegida papelNecessario="aluno">
              <LayoutComChat socket={socket}>
                <AgendarHorario />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/forum"
          element={
            <RotaProtegida papelNecessario="aluno">
              <LayoutComChat socket={socket}>
                <Forum />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/agendamentos"
          element={
            <RotaProtegida papelNecessario="monitor">
              <LayoutComChat socket={socket}>
                <Agendamentos />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/painel-admin"
          element={
            <RotaProtegida>
              <LayoutComChat socket={socket}>
                <PainelAdmin />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RotaProtegida>
              <LayoutComChat socket={socket}>
                <ListarUsuarios />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/editar-usuario/:id"
          element={
            <RotaProtegida>
              <LayoutComChat socket={socket}>
                <EditarUsuario />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/painel-aluno"
          element={
            <RotaProtegida papelNecessario="aluno">
              <LayoutComChat socket={socket}>
                <PainelAluno />
              </LayoutComChat>
            </RotaProtegida>
          }
        />

        <Route
          path="/painel-monitor"
          element={
            <RotaProtegida papelNecessario="monitor">
              <LayoutComChat socket={socket}>
                <PainelMonitor />
              </LayoutComChat>
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
