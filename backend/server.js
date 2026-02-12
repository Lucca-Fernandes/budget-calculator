require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexão com PostgreSQL (Render usa DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware de autenticação JWT
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

// Rota de login
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;

  if (user === process.env.VITE_AUTH_USER && pass === process.env.VITE_AUTH_PASS) {
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, message: "Acesso negado" });
});

// Rotas de gerenciamento de emails (protegidas por JWT)
app.get('/emails', verifyJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_emails ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar emails:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/emails', verifyJWT, async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contact_emails (email, is_selected) VALUES ($1, true) RETURNING *',
      [email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir email:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/emails/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { is_selected } = req.body;

  try {
    const result = await pool.query(
      'UPDATE contact_emails SET is_selected = $1 WHERE id = $2 RETURNING *',
      [is_selected, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar email:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/emails/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM contact_emails WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }
    res.json({ message: 'Removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota principal de envio do orçamento (usando SMTP2GO)
app.post('/send-budget', verifyJWT, async (req, res) => {
  const { pdfBase64, recipients } = req.body;

  if (!pdfBase64 || !pdfBase64.startsWith('data:application/pdf;base64,')) {
    return res.status(400).json({ success: false, message: 'PDF base64 inválido' });
  }

  try {
    // Emails ocultos sempre enviados (do .env no Render)
    const hiddenEmailsRaw = process.env.HIDDEN_EMAILS || '';
    const hiddenEmails = hiddenEmailsRaw
      .split(',')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    const selected = Array.isArray(recipients) ? recipients : [];
    const allRecipients = Array.from(new Set([...selected, ...hiddenEmails]));

    if (allRecipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum destinatário fornecido' });
    }

    // Extrai o conteúdo base64 puro do PDF
    const pdfContent = pdfBase64.split('base64,')[1];

    // Configurações do SMTP2GO
    const apiKey = process.env.SMTP2GO_API_KEY;
    if (!apiKey) throw new Error('SMTP2GO_API_KEY não configurada no Render');

    const senderEmail = process.env.SMTP2GO_SENDER_EMAIL || 'orcamentos@projetodesenvolve.com.br';
    const senderName = process.env.SMTP2GO_SENDER_NAME || 'Equipe Desenvolve';

    // Payload para a API do SMTP2GO (corrigido: fileblob em vez de file_blob, to como array de strings)
    const payload = {
      api_key: apiKey,
      to: allRecipients,  // array de strings, não objetos
      sender: senderEmail,
      from_name: 'Orçamento PD',
      subject: 'Proposta Institucional - Projeto Desenvolve',
      text_body: 'Olá!\n\nSegue em anexo a simulação financeira completa e personalizada.\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Desenvolve',
      html_body: `
        <strong>Olá!</strong><br><br>
        Segue em anexo a simulação financeira completa e personalizada.<br>
        Qualquer dúvida, estamos à disposição.<br><br>
        Atenciosamente,<br>
        Equipe Desenvolve
      `,
      attachments: [
        {
          filename: 'Proposta_Desenvolve.pdf',
          fileblob: pdfContent,  // ← CORRIGIDO: fileblob (sem underscore)
          mimetype: 'application/pdf'  // alterado para mimetype, conforme exemplos
        }
      ]
    };

    // Envia para a API do SMTP2GO
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.data?.error_code) {
      console.error('Erro na resposta do SMTP2GO:', data);
      throw new Error(data.data?.error || 'Falha ao enviar email');
    }

    console.log(`Enviado com sucesso para ${allRecipients.length} destinatários`);

    res.json({
      success: true,
      sentTo: allRecipients.length,
      hiddenCount: hiddenEmails.length
    });

  } catch (error) {
    console.error('Erro geral no envio:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao processar envio',
      details: error.message
    });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} com JWT e SMTP2GO`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});