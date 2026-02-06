require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Resend } = require('resend'); // Substituído Nodemailer por Resend
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexão com Banco de Dados (Neon/Postgres)
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Garante conexão SSL com Neon
});

// Inicialização do Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware de Autenticação JWT
const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Sessão expirada ou inválida" });
    }
    req.user = decoded;
    next();
  });
};

// --- ROTA DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;

  if (user === process.env.VITE_AUTH_USER && pass === process.env.VITE_AUTH_PASS) {
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token: token });
  }

  res.status(401).json({ success: false, message: "Acesso negado" });
});

// --- CRUD DE EMAILS (PROTEGIDO) ---

app.get('/emails', verifyJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_emails ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/emails', verifyJWT, async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('INSERT INTO contact_emails (email, is_selected) VALUES ($1, true) RETURNING *', [email]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/emails/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { is_selected } = req.body;
  try {
    const result = await pool.query('UPDATE contact_emails SET is_selected = $1 WHERE id = $2 RETURNING *', [is_selected, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/emails/:id', verifyJWT, async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_emails WHERE id = $1', [req.params.id]);
    res.json({ message: 'Removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTA DE DISPARO DE ORÇAMENTO (ATUALIZADA PARA RESEND) ---
app.post('/send-budget', verifyJWT, async (req, res) => {
  const { pdfBase64, recipients } = req.body;

  try {
    // Nota: Se não tiver domínio próprio configurado no Resend, 
    // use 'onboarding@resend.dev' como remetente.
    const { data, error } = await resend.emails.send({
      from: 'Orcamento <onboarding@resend.dev>', 
      to: recipients, // Resend aceita o array ['email1', 'email2'] diretamente
      subject: 'Orçamento - Teste de Envio',
      html: '<strong>Olá!</strong><p>Segue em anexo o PDF solicitado: TESTANDO ENVIO.</p>',
      attachments: [
        {
          filename: 'orcamento.pdf',
          content: pdfBase64.split("base64,")[1],
        }
      ]
    });

    if (error) {
      console.error("ERRO NO RESEND:", error);
      return res.status(400).json({ success: false, error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("ERRO NO SERVIDOR:", error);
    res.status(500).json({ 
      error: 'Falha ao processar envio', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} com JWT e Resend`));