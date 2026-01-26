require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentado para suportar o envio do PDF em base64

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configuração do Transportador de Email (Exemplo Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Seu email no .env
    pass: process.env.EMAIL_PASS  // Sua senha de app no .env
  }
});

// --- Rotas de Emails no Banco (Mantidas) ---
app.get('/emails', async (req, res) => {
  const result = await pool.query('SELECT * FROM contact_emails ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/emails', async (req, res) => {
  const { email } = req.body;
  const result = await pool.query('INSERT INTO contact_emails (email, is_selected) VALUES ($1, true) RETURNING *', [email]);
  res.json(result.rows[0]);
});

app.patch('/emails/:id', async (req, res) => {
  const { id } = req.params;
  const { is_selected } = req.body;
  const result = await pool.query('UPDATE contact_emails SET is_selected = $1 WHERE id = $2 RETURNING *', [is_selected, id]);
  res.json(result.rows[0]);
});

app.delete('/emails/:id', async (req, res) => {
  await pool.query('DELETE FROM contact_emails WHERE id = $1', [req.params.id]);
  res.json({ message: 'Removido' });
});

// --- NOVA ROTA: DISPARO DE PDF ---
app.post('/send-budget', async (req, res) => {
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
    res.json({ success: true, message: 'Emails enviados!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao enviar e-mail' });
  }
});

app.listen(3001, () => console.log('Servidor rodando na porta 3001'));