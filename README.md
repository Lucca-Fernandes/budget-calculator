
# 📊 Budget Calculator Pro <br>

Sistema completo de simulação de orçamentos estudantis com gestão de destinatários e envio automatizado de propostas em PDF.

🚀 Funcionalidades
Cálculo Dinâmico: Conversão automática de quantidade de alunos em custos totais, entradas (10%/10%) e parcelamento.

Distribuição Anual: Lógica inteligente que projeta o faturamento por ano  baseado em 24 parcelas.

Gestão de Contatos: CRUD de e-mails integrado ao banco de dados PostgreSQL (Neon).

Envio de PDF: Geração de documentos leves e disparo via Nodemailer com integração Gmail.

Feedback Visual: Notificações em tempo real com React-Toastify.

🛠️ Tecnologias
Frontend:

React + Vite + TypeScript

Material UI (Interface)

jsPDF (Geração de documentos)

Backend:

Node.js + Express

PostgreSQL (Neon.tech)

Dotenv (Segurança)

# 📦 Instalação e Configuração: Backend

<strong>cd backend

npm install



env example:
</strong>


DATABASE_URL=sua_url_do_neon
EMAIL_USER=seu_gmail@gmail.com
EMAIL_PASS=sua_senha_de_app_google
PORT=3001

# Na raiz do projeto Frontend

<strong>npm install
</strong>
 
# Como Rodar:

<strong>backend:</strong>

cd backend

node server.js

<strong>Frontend</strong>


npm run dev
