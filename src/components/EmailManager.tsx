import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Checkbox, IconButton, List, ListItem, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';

const API_URL = 'https://budget-calculator-zntc.onrender.com';


const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('@BudgetApp:token')}`,
  'Content-Type': 'application/json'
});

export const EmailManager: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]); //
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    try {
      const r = await fetch(`${API_URL}/emails`, {
        headers: getAuthHeader()
      });
      if (r.status === 403 || r.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }
      const data = await r.json();
      
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEmails([]);
    }
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleAddEmail = async () => {
    if (!newEmail) return;
    try {
      await fetch(`${API_URL}/emails`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ email: newEmail }),
      });
      setNewEmail('');
      fetchEmails();
      toast.success("E-mail adicionado!");
    } catch { toast.error("Erro ao salvar."); }
  };

  const handleSendPDF = async () => {
    const selected = emails.filter(e => e.is_selected).map(e => e.email);
    if (selected.length === 0) return toast.warn("Selecione um destinatário!");

    setLoading(true);
    try {
      const pdf = new jsPDF();
      pdf.text("ORÇAMENTO - TESTE PDF ENVIO", 20, 30);
      const pdfBase64 = pdf.output('datauristring');

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ pdfBase64, recipients: selected }),
      });

      if (res.ok) toast.success("Enviado com sucesso!");
      else toast.error("Erro no envio.");
    } catch { toast.error("Falha na conexão."); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ mt: 3, p: 2, borderTop: '1px dashed #ccc' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax' }}>Enviar Orçamento</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField 
          fullWidth size="small" 
          value={newEmail} 
          onChange={e => setNewEmail(e.target.value)}
          placeholder="email@exemplo.com"
        />
        <Button variant="contained" onClick={handleAddEmail} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }}>
        {emails && emails.length > 0 ? emails.map(e => (
          <ListItem key={e.id} divider>
            <Checkbox 
              checked={e.is_selected} 
              onChange={async () => {
                await fetch(`${API_URL}/emails/${e.id}`, { 
                  method: 'PATCH', 
                  headers: getAuthHeader(), 
                  body: JSON.stringify({is_selected: !e.is_selected}) 
                });
                fetchEmails();
              }} 
            />
            <ListItemText primary={e.email} />
            <IconButton onClick={async () => {
              await fetch(`${API_URL}/emails/${e.id}`, { 
                method: 'DELETE',
                headers: getAuthHeader()
              });
              fetchEmails();
            }}><DeleteIcon sx={{ color: 'red' }} /></IconButton>
          </ListItem>
        )) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: '#666' }}>Nenhum e-mail cadastrado.</Typography>
        )}
      </List>

      <Button 
        fullWidth variant="contained" 
        disabled={loading || emails.length === 0} 
        onClick={handleSendPDF} 
        sx={{ mt: 2, bgcolor: '#9100ff', py: 1.5 }}
      >
        {loading ? "ENVIANDO..." : "ENVIAR TESTE PDF"}
      </Button>
    </Box>
  );
};