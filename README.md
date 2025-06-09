
[![logo.png](https://i.postimg.cc/hvB73mLh/logo.png)](https://postimg.cc/R6gFWNbz)

# 📚 FatecConnect

O projeto **FatecConnect** tem como objetivo modernizar o sistema de monitoria da FATEC, oferecendo uma plataforma online que permite:

- Agendamento de monitorias individuais.
- Chat em tempo real entre alunos e monitores.
- Fórum de dúvidas por curso e disciplina.
- Divulgação de oportunidades de estágio e cursos gratuitos.

## 🧾 Índice

- [🛠️ Tecnologias Utilizadas](#🛠️-tecnologias-utilizadas)
- [⚙️ Como Executar o Projeto](#⚙️-como-executar-o-projeto)
  - [Front-End](#front-end)
  - [Back-End](#back-end)
- [📦 Funcionalidades](#📦-funcionalidades)
- [🌐 Deploy](#🌐-deploy)
- [👩‍🏫 Agradecimentos](#👩‍🏫-agradecimentos)
- [👩‍💻 Integrantes](#👩‍💻-integrantes)
## 🛠️ Tecnologias Utilizadas

### **Front-End**
- **React 18.2** – Biblioteca JavaScript para criação de interfaces reativas  
- **React Router DOM 7.5** – Gerenciamento de rotas no front-end  
- **Bootstrap 5.3** – Estilização com grid e componentes responsivos  
- **Material UI 7.0** – Componentes visuais modernos e acessíveis  
- **MUI Icons** – Ícones vetoriais integrados ao Material UI  
- **React Icons 5.5** – Coleção de ícones populares para React  
- **Axios 1.9** – Requisições HTTP assíncronas  
- **Socket.IO Client 4.8** – Comunicação em tempo real com o back-end  
- **Emoji Mart** – Picker de emojis personalizável  
- **React Datepicker** – Componente de seleção de datas  
- **Date-fns 4.1** – Manipulação de datas com funções utilitárias  
- **JWT Decode** – Decodificação de tokens JWT no front-end  
- **Swiper 11.2** – Slides/carrosséis modernos responsivos

### **Back-End**
- **Node.js** – Ambiente de execução JavaScript no servidor  
- **Express 4.21** – Framework web minimalista para Node.js  
- **MongoDB + Mongoose 8.13** – Banco de dados NoSQL com modelagem de dados  
- **JWT 9.0** – Autenticação com tokens JSON Web Token  
- **BcryptJS 3.0** – Criptografia de senhas com hash  
- **Multer** – Upload de arquivos (como imagens de perfil)  
- **Nodemailer 6.10** – Envio de e-mails (ex: redefinição de senha)  
- **Socket.IO 4.8** – Comunicação em tempo real (ex: chat)  
- **UUID 11.1** – Geração de identificadores únicos  
- **Dotenv 16.5** – Carregamento de variáveis de ambiente  
- **Morgan** – Logs de requisições HTTP para debug  
- **Cors** – Permissão de requisições entre domínios  
- **Nodemon 3.1** (dev) – Reinicialização automática em ambiente de desenvolvimento
## 🚀 Funcionalidades

### 🔐 **Login e Autenticação**
- Login seguro com verificação de email e senha utilizando **bcrypt**.
- Geração de **JWT (JSON Web Token)** para autenticação e autorização.
- Diferentes tipos de usuários: **Aluno**, **Monitor** e **Admin**.
- Redefinição de senha via email com **Nodemailer**.

### 👨‍🏫 **Gestão de Usuários**
- Cadastro e edição de perfis para alunos, monitores e administradores.
- Upload de imagem de perfil com **Multer**.

### 📅 **Agendamentos de Monitoria**
- Alunos podem agendar monitorias com monitores disponíveis.
- Monitores visualizam seus agendamentos por data e horário.
- Monitor define seus horários disponíveis.

### 💬 **Chat em Tempo Real**
- Integração com **Socket.IO** para comunicação em tempo real entre alunos e monitores.
- Notificações e mensagens instantâneas.

### 📚 **Fórum de Dúvidas**
- Alunos podem postar dúvidas e comentar.
- Organização por curso.

### 🛡️ **Sistema de Permissões**
- Acesso restrito a funcionalidades conforme o tipo de usuário.
- Verificação de token e middleware de autenticação no back-end.

## Rodando localmente
## ⚙️ Como Executar o Projeto

### 📁 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** (versão 18)
- **MongoDB** (local ou Atlas)
- **Git** (opcional)

---

### 🗄️ Banco de Dados (MongoDB Atlas)

1. Este projeto utiliza **MongoDB Atlas** como banco de dados na nuvem.

2. Certifique-se de criar um cluster no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) e obter a sua string de conexão que deve ser colocada no seu .env.


### 🖥️ Front-End (React)

1. Acesse a pasta do front-end:
   ```bash
   cd connect-frontend
    ```
2. Instale as dependencias:
    ```bash
    npm install
    ```
3. Atualize o arquivo api.js (/src/services/api.js):
    ```bash
    http://localhost:5000/api
    ```
3. Rodar em modo de desenvolvimento:
    ```bash
    npm start
    ```
4. O frontend estará disponível na porta http://localhost:3000


### 🔧 Back-End (Node.js + Express)

1. Acesse a pasta do front-end:
   ```bash
   cd connect-backend

2. Instale todas as dependências:
    ```bash
    npm install

3. Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:

    ```bash
    PORT=5000
    MONGO_URI=string_de_conexao_mongodb
    JWT_SECRET=sua_chave_jwt
    EMAIL_USER=seu_email@gmail.com
    EMAIL_PASS=sua_senha

4. Inicie o servidor de desenvolvimento:
    ```bash
    npm start

4. O app React estará disponível em:
http://localhost:5000

## 🌐 Deploy
A aplicação foi publicada em ambiente web.

### 🔗 [FatecConnect](https://fatecconnect-frontend.onrender.com)

## 📄 Documentação

A documentação completa do projeto está disponível no repositório na pasta /documentacao, estruturada conforme as normas da ABNT, contendo os capítulos 1 a 7.


## 👩‍🏫 Agradecimentos

Agradecemos à professora **Eulaliane Gonçalves** pelo apoio e orientação durante o desenvolvimento deste projeto, e à Fatec Praia Grande e ao Centro Paula Souza pela oportunidade de aprendizado e desenvolvimento técnico e profissional.

## 👩‍💻 Integrantes

- [@anabefernandes](https://github.com/anabefernandes) | Ana Beatriz Fernandes Caldeira da Silva  
  *Responsável pelo back-end*

- [@DudaFontes14](https://github.com/DudaFontes14) | Maria Eduarda Fontes dos Santos  
  *Responsável pelo back-end*

- [@JuRibeiro14](https://github.com/JuRibeiro14) | Julia Lopes Ribeiro  
  *Responsável pelo front-end* 

- [@Brusamt](https://github.com/Brusamt) | Bruna Martins Santana  
  *Responsável pela documentação*
