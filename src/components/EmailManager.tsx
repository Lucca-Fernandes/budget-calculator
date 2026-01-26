import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Checkbox, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import jsPDF from 'jspdf';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
const PRIMARY_PURPLE = '#9100ff';
const API_URL = 'http://localhost:3001';

export const EmailManager: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmails = () => fetch(`${API_URL}/emails`).then(r => r.json()).then(setEmails);
  useEffect(() => { fetchEmails(); }, []);

  // VALIDAÇÃO DE EMAIL
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddEmail = async () => {
    if (!isValidEmail(newEmail)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    });
    setNewEmail('');
    fetchEmails();
  };

  const handleSendPDF = async () => {
    const selected = emails.filter(e => e.is_selected).map(e => e.email);
    if (selected.length === 0) return alert("Selecione ao menos um e-mail");

    setLoading(true);
    
    // 1. Gerar PDF Simples
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("TESTANDO ENVIO", 20, 20);
    doc.setFontSize(12);
    doc.text("Este é um PDF de teste gerado pelo sistema.", 20, 40);
    const pdfBase64 = doc.output('datauristring');

    // 2. Enviar para o Backend
    try {
      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, recipients: selected }),
      });
      if(res.ok) alert("Enviado com sucesso!");
    } catch (e) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="exemplo@email.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
        />
        <Button variant="contained" onClick={handleAddEmail} sx={{ bgcolor: PRIMARY_PURPLE }}>
          <AddIcon />
        </Button>
      </Box>

      <List sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
        {emails.map((item) => (
          <ListItem key={item.id} divider>
            <Checkbox 
              checked={item.is_selected} 
              onChange={async () => {
                await fetch(`${API_URL}/emails/${item.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_selected: !item.is_selected }),
                });
                fetchEmails();
              }}
              sx={{ color: PRIMARY_PURPLE }}
            />
            <ListItemText primary={item.email} />
            <ListItemSecondaryAction>
              <IconButton onClick={async () => {
                await fetch(`${API_URL}/emails/${item.id}`, { method: 'DELETE' });
                fetchEmails();
              }}>
                <DeleteIcon sx={{ color: 'red' }} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Button
        fullWidth
        variant="contained"
        disabled={loading || emails.filter(e => e.is_selected).length === 0}
        onClick={handleSendPDF}
        sx={{ mt: 3, py: 1.5, fontFamily: FONT_FAMILY, bgcolor: PRIMARY_PURPLE, fontWeight: 'bold' }}
      >
        {loading ? "ENVIANDO..." : "GERAR E ENVIAR PDF TESTE"}
      </Button>
    </Box>
  );
};