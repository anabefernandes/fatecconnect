require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./configs/db");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/User");
const Curso = require("./models/Curso");

// Rotas
const monitoresRoutes = require("./routes/monitoresRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const agendamentosRoutes = require("./routes/agendamentosRoutes");
const forumRoutes = require("./routes/forumRoutes");
const vagasRoutes = require("./routes/vagasRoutes");

// Inicialização do app
const app = express();
const server = http.createServer(app);

// Configurações básicas
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configuração do Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Gerenciamento de conexões para o chat
const monitoresOnline = new Map();
const usuariosConectados = new Map();
const salasPrivadas = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Nova conexão Socket.IO:", socket.id);

  socket.on("join_chat", (userData) => {
    if (!userData || !userData.nome || !userData.papel) {
      return socket.emit("connection_error", "Dados de usuário inválidos");
    }

    console.log(
      `👤 ${userData.papel.toUpperCase()} conectado: ${userData.nome}`
    );
    socket.userData = userData;
    usuariosConectados.set(socket.id, userData);

    if (userData.papel === "monitor") {
      monitoresOnline.set(socket.id, userData);
      atualizarListaMonitores();
    } else {
      // Alunos não entram mais no chat global automaticamente
      // Eles esperarão para iniciar uma conversa privada com um monitor
      socket.emit("status_chat", { message: "Aguardando para iniciar um chat privado." });
    }

    socket.emit("connection_success", {
      message: "Conectado ao chat com sucesso",
      user: userData,
    });
  });

  // Novo: Evento para o aluno solicitar um chat com um monitor
  socket.on("request_private_chat", (monitorId) => {
    const aluno = usuariosConectados.get(socket.id);
    const monitor = monitoresOnline.get(monitorId);

    if (!aluno || aluno.papel !== "aluno") {
      return socket.emit("chat_error", "Apenas alunos podem solicitar chats privados.");
    }
    if (!monitor) {
      return socket.emit("chat_error", "Monitor não encontrado ou offline.");
    }
    // Verifica se o monitor já está em uma sala
    if (salasPrivadas.has(monitorId)) {
      return socket.emit("chat_error", "Este monitor já está em outra conversa.");
    }

    // Cria um ID de sala único para a conversa privada
    const roomId = `private_${monitorId}_${socket.id}`;
    socket.join(roomId); // Aluno entra na sala
    io.to(monitorId).emit("private_chat_requested", {
      studentId: socket.id,
      studentName: aluno.nome,
      roomId: roomId,
    }); // Notifica o monitor

    // Armazena a informação da sala
    salasPrivadas.set(monitorId, {
      studentSocketId: socket.id,
      roomId: roomId,
      monitorName: monitor.nome,
      studentName: aluno.nome,
    });

    console.log(`💬 Chat privado solicitado: Aluno ${aluno.nome} com Monitor ${monitor.nome} na sala ${roomId}`);
    socket.emit("private_chat_initiated", { roomId: roomId, partnerName: monitor.nome });
  });

  // Novo: Evento para o monitor aceitar o chat
  socket.on("accept_private_chat", (data) => {
    const monitor = usuariosConectados.get(socket.id);
    if (!monitor || monitor.papel !== "monitor") {
      return socket.emit("chat_error", "Apenas monitores podem aceitar chats.");
    }

    const { studentId, roomId } = data;
    const alunoSocket = io.sockets.sockets.get(studentId);

    if (!alunoSocket) {
      return socket.emit("chat_error", "Aluno desconectado.");
    }
    if (!salasPrivadas.has(socket.id) || salasPrivadas.get(socket.id).roomId !== roomId) {
      return socket.emit("chat_error", "Requisição de chat inválida.");
    }

    socket.join(roomId); // Monitor entra na sala
    io.to(roomId).emit("chat_room_ready", { roomId: roomId });
    console.log(`✅ Monitor ${monitor.nome} aceitou o chat privado com o aluno ${salasPrivadas.get(socket.id).studentName} na sala ${roomId}`);
    socket.emit("private_chat_initiated", { roomId: roomId, partnerName: salasPrivadas.get(socket.id).studentName });
  });

  // Evento send_message ajustado para enviar apenas para a sala privada
  socket.on("send_message", (data) => {
    const sender = usuariosConectados.get(socket.id);
    if (!sender || !data.message || !data.roomId) {
      return socket.emit("message_error", "Mensagem inválida ou sala não especificada.");
    }

    const messageData = {
      _id: Date.now().toString(),
      userId: socket.id,
      username: sender.nome,
      message: data.message,
      timestamp: new Date(),
      isMonitor: sender.papel === "monitor",
      papel: sender.papel,
    };

    // Verifica se o remetente está na sala especificada
    if (!socket.rooms.has(data.roomId)) {
        return socket.emit("message_error", "Você não está nesta sala de chat.");
    }

    console.log(`📩 Mensagem de ${sender.nome} na sala ${data.roomId}: ${data.message}`);
    io.to(data.roomId).emit("receive_message", messageData);
  });

  // Novo: Evento para finalizar o chat privado
  socket.on("end_private_chat", (roomId) => {
    const sender = usuariosConectados.get(socket.id);
    if (!sender || !roomId) {
      return socket.emit("chat_error", "Dados inválidos para finalizar o chat.");
    }

    // Encontrar o monitor associado a esta sala
    let monitorIdInRoom = null;
    for (let [monitorSocketId, chatInfo] of salasPrivadas.entries()) {
      if (chatInfo.roomId === roomId && (chatInfo.studentSocketId === socket.id || monitorSocketId === socket.id)) {
        monitorIdInRoom = monitorSocketId;
        break;
      }
    }

    if (monitorIdInRoom) {
      const chatInfo = salasPrivadas.get(monitorIdInRoom);
      const studentSocket = io.sockets.sockets.get(chatInfo.studentSocketId);
      const monitorSocket = io.sockets.sockets.get(monitorIdInRoom);

      if (studentSocket) {
        studentSocket.leave(roomId);
        studentSocket.emit("chat_ended", "O chat foi finalizado.");
      }
      if (monitorSocket) {
        monitorSocket.leave(roomId);
        monitorSocket.emit("chat_ended", "O chat foi finalizado.");
      }
      salasPrivadas.delete(monitorIdInRoom); // Remove a sala
      console.log(`🛑 Chat privado na sala ${roomId} finalizado.`);
    } else {
        socket.emit("chat_error", "Sala de chat não encontrada ou você não faz parte dela.");
    }
  });


  socket.on("disconnect", () => {
    console.log("❌ Usuário desconectado:", socket.id);
    if (monitoresOnline.has(socket.id)) {
      // Se um monitor desconecta, verifica se ele estava em um chat privado
      if (salasPrivadas.has(socket.id)) {
        const chatInfo = salasPrivadas.get(socket.id);
        const studentSocket = io.sockets.sockets.get(chatInfo.studentSocketId);
        if (studentSocket) {
          studentSocket.leave(chatInfo.roomId);
          studentSocket.emit("chat_ended", "O monitor se desconectou. O chat foi finalizado.");
        }
        salasPrivadas.delete(socket.id);
      }
      monitoresOnline.delete(socket.id);
      atualizarListaMonitores();
    } else {
      // Se um aluno desconecta, verifica se ele estava em um chat privado
      let monitorOfThisStudent = null;
      for (let [monitorSocketId, chatInfo] of salasPrivadas.entries()) {
        if (chatInfo.studentSocketId === socket.id) {
          monitorOfThisStudent = monitorSocketId;
          break;
        }
      }
      if (monitorOfThisStudent) {
        const chatInfo = salasPrivadas.get(monitorOfThisStudent);
        const monitorSocket = io.sockets.sockets.get(monitorOfThisStudent);
        if (monitorSocket) {
          monitorSocket.leave(chatInfo.roomId);
          monitorSocket.emit("chat_ended", "O aluno se desconectou. O chat foi finalizado.");
        }
        salasPrivadas.delete(monitorOfThisStudent);
      }
    }
    usuariosConectados.delete(socket.id);
  });

  function atualizarListaMonitores() {
  const lista = Array.from(monitoresOnline.entries()).map(([id, monitor]) => ({
    id: id,
    nome: monitor.nome,
    curso: monitor.curso, // Certifique-se que 'curso' esteja definido se você o usa
    isAvailable: !salasPrivadas.has(id), // <--- ESSA LINHA É ESSENCIAL E DEVE ESTAR AQUI
  }));
  console.log("🚀 Lista de monitores online e disponível:", lista); // Para verificar no console do servidor
  io.emit("monitores_online", lista);
}
});

// Rotas da API
app.use("/api", monitoresRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", vagasRoutes);
app.use("/api", forumRoutes);
app.use("/api", agendamentosRoutes);

// Inicialização de admin padrão
const inicializarAdmin = async () => {
  try {
    const adminExiste = await User.findOne({ email: "admin@fatec.sp.gov.br" });
    const cursoAdmin = await Curso.findOne({ nome: "Admin" });

    if (!adminExiste) {
      const salt = await bcrypt.genSalt(10);
      const admin = new User({
        nome: "Admin Global",
        email: "admin@fatec.sp.gov.br",
        senha: await bcrypt.hash("admin123", salt),
        papel: "admin",
        curso: cursoAdmin ? cursoAdmin._id : null,
        ra: "0000000",
      });
      await admin.save();
      console.log("✅ Admin global criado");
    }
  } catch (err) {
    console.error("❌ Erro ao criar admin:", err);
  }
};

// Inicialização de cursos padrão
const inicializarCursos = async () => {
  try {
    const cursosIniciais = ["DSM", "ADS", "COMEX", "GE", "PQ", "Admin"];

    for (const nomeCurso of cursosIniciais) {
      const cursoExiste = await Curso.findOne({ nome: nomeCurso });
      if (!cursoExiste) {
        await Curso.create({ nome: nomeCurso });
        console.log(`✅ Curso "${nomeCurso}" criado`);
      } else {
        console.log(`Curso "${nomeCurso}" já existe`);
      }
    }
  } catch (err) {
    console.error("❌ Erro ao criar cursos iniciais:", err);
  }
};

// Inicia o servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await inicializarAdmin();
  await inicializarCursos();
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});
