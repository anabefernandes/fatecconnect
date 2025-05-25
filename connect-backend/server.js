const dotenv = require("dotenv");
const express = require("express");
const db = require("./configs/db");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const monitorsRoutes = require("./routes/monitorsRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const User = require("./models/User");
const Curso = require("./models/Curso");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS aberto para qualquer origem
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Mapa de conexões
const monitoresOnline = new Map();
const usuariosConectados = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Nova conexão Socket.IO:", socket.id);

  socket.on("join_chat", (userData) => {
    try {
      if (!userData || !userData.nome || !userData.papel) {
        return socket.emit("connection_error", "Dados de usuário inválidos");
      }

      console.log(`👤 ${userData.papel.toUpperCase()} conectado: ${userData.nome}`);
      socket.userData = userData;
      usuariosConectados.set(socket.id, userData);
      socket.join("global_chat");

      if (userData.papel === "monitor") {
        monitoresOnline.set(socket.id, userData);
        atualizarListaMonitores();
      }

      socket.emit("connection_success", {
        message: "Conectado ao chat com sucesso",
        user: userData,
      });
    } catch (error) {
      console.error("Erro no join_chat:", error);
    }
  });

  socket.on("send_message", (data) => {
    const sender = usuariosConectados.get(socket.id);
    if (!sender || !data.message) {
      return socket.emit("message_error", "Mensagem inválida");
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

    console.log(`📩 Mensagem de ${sender.nome}: ${data.message}`);
    io.to("global_chat").emit("receive_message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuário desconectado:", socket.id);
    if (monitoresOnline.has(socket.id)) {
      monitoresOnline.delete(socket.id);
      atualizarListaMonitores();
    }
    usuariosConectados.delete(socket.id);
  });

  function atualizarListaMonitores() {
    const lista = Array.from(monitoresOnline.values()).map((monitor) => ({
      id: monitor._id,
      nome: monitor.nome,
      curso: monitor.curso,
    }));
    io.to("global_chat").emit("monitores_online", lista);
  }
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/monitores", monitorsRoutes);

// Inicialização do admin
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

// Inicialização dos cursos padrão
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

// Inicializa servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await inicializarCursos();
  await inicializarAdmin();
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
