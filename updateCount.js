const { MongoClient } = require("mongodb");
const simpleGit = require("simple-git");
const fs = require("fs/promises");

const MONGO_URI = process.env.MONGO_URI;
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const DB_NAME = "fatecconnect";
const COLLECTION = "users";

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usuarios = db.collection(COLLECTION);

    const totalAlunos = await usuarios.countDocuments({ papel: "aluno" });
    const totalMonitores = await usuarios.countDocuments({ papel: "monitor" });
    const totalAdmins = await usuarios.countDocuments({ papel: "admin" });
    const total = totalAlunos + totalMonitores;

    const conteudo = `
# Contagem de Usuários FatecConect

Alunos monitores: ${totalAlunosMonitores}  
Alunos: ${totalAlunos}  
Total: ${total}  
Administradores: ${totalAdmins}  
`;

    await fs.writeFile("contagem.md", conteudo);

    const git = simpleGit();

    await git.addConfig("user.email", process.env.GIT_EMAIL);
    await git.addConfig("user.name", process.env.GIT_USERNAME);

    // Atualiza a URL remota com autenticação via token
    await git.remote([
      "set-url",
      "origin",
      `https://gitlab-ci-token:${GITLAB_TOKEN}@gitlab.com/anabefernandes/fatecconnect.git`
    ]);

    await git.add("contagem.md");
    await git.commit("Atualiza contagem de usuários via pipeline");
    await git.push("origin", "HEAD:main");

    console.log("Arquivo contagem.md atualizado e commitado com sucesso.");
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1); 
  } finally {
    await client.close();
  }
}

run();
