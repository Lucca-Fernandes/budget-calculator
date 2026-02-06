require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false 
  }
});

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


app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;

  if (user === process.env.VITE_AUTH_USER && pass === process.env.VITE_AUTH_PASS) {
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    return res.json({ 
      success: true, 
      token: token 
    });
  }

  res.status(401).json({ success: false, message: "Acesso negado" });
});


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

app.post('/send-budget', verifyJWT, async (req, res) => {
  const { pdfBase64, recipients } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(','),
    subject: 'Orçamento - Teste de Envio',
    text: 'Olá! Segue em anexo o PDF solicitado: TESTANDO ENVIO.',
    attachments: [
      {
        filename: 'orcamento.pdf',
        content: pdfBase64.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error("ERRO DETALHADO NO NODEMAILER:", error);
    res.status(500).json({ 
      error: 'Falha ao enviar e-mail', 
      details: error.message 
    });
  }
});

app.listen(3001, () => console.log('Servidor rodando na porta 3001 com JWT ativo'));