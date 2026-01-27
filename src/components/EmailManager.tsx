import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Checkbox, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:3001';

export const EmailManager: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmails = () => fetch(`${API_URL}/emails`).then(r => r.json()).then(setEmails);
  useEffect(() => { fetchEmails(); }, []);

  const handleAddEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Por favor, insira um e-mail válido!");
      return;
    }
    try {
      await fetch(`${API_URL}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
      setNewEmail('');
      fetchEmails();
      toast.success("E-mail adicionado à lista!");
    } catch { toast.error("Erro ao salvar e-mail."); }
  };

  const handleSendPDF = async () => {
  const selected = emails.filter(e => e.is_selected).map(e => e.email);
  if (selected.length === 0) return toast.warn("Selecione um destinatário!");

  setLoading(true);

  try {
    // Gerando um PDF extremamente leve (apenas texto)
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("ORÇAMENTO - TESTE PDF ENVIO", 20, 30);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text("Este é um documento de teste simplificado.", 20, 50);
    pdf.text(`Gerado em: ${new Date().toLocaleString()}`, 20, 60);

    // Converte para string Base64 curta
    const pdfBase64 = pdf.output('datauristring');

    const res = await fetch(`${API_URL}/send-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64, recipients: selected }),
    });

    if (res.ok) {
      toast.success("E-mail enviado instantaneamente!");
    } else {
      toast.error("Erro ao processar envio.");
    }
  } catch (err) {
    toast.error("Erro na conexão.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ mt: 3, p: 2, borderTop: '1px dashed #ccc' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax' }}>Enviar Orçamento</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField 
          fullWidth size="small" 
          placeholder="email@exemplo.com" 
          value={newEmail} 
          onChange={e => setNewEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
        />
        <Button variant="contained" onClick={handleAddEmail} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }}>
        {emails.map(e => (
          <ListItem key={e.id} divider>
            <Checkbox 
              checked={e.is_selected} 
              onChange={async () => {
                await fetch(`${API_URL}/emails/${e.id}`, { 
                  method: 'PATCH', 
                  headers: {'Content-Type': 'application/json'}, 
                  body: JSON.stringify({is_selected: !e.is_selected}) 
                });
                fetchEmails();
              }} 
            />
            <ListItemText primary={e.email} />
            <IconButton onClick={async () => {
              await fetch(`${API_URL}/emails/${e.id}`, { method: 'DELETE' });
              fetchEmails();
              toast.info("E-mail removido.");
            }}><DeleteIcon sx={{ color: 'red' }} /></IconButton>
          </ListItem>
        ))}
      </List>

      <Button 
        fullWidth variant="contained" 
        disabled={loading || emails.filter(e => e.is_selected).length === 0} 
        onClick={handleSendPDF} 
        sx={{ mt: 2, bgcolor: '#9100ff', py: 1.5, fontWeight: 'bold' }}
      >
        {loading ? "PROCESSANDO..." : "GERAR E ENVIAR PDF"}
      </Button>
    </Box>
  );
};