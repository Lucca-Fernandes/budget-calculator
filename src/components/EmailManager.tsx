import { PDFDocument, rgb,  } from 'pdf-lib';
import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Checkbox, IconButton, 
  List, ListItem, ListItemText, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { toast, ToastContainer } from 'react-toastify';


const API_URL = 'https://budget-calculator-zntc.onrender.com';

interface EmailManagerProps {
  calculatedStudents: number;
  totalCost: number;
  entryFee: number;
  deliveryFee: number;
  monthlyPayment: number;
  totalMonthlyParcels: number;
  yearlyPayments: any[];
  formatNumber: (value: number) => string;
}

export const EmailManager: React.FC<EmailManagerProps> = ({
  }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [openCityPopup, setOpenCityPopup] = useState(false);
  const [cityName, setCityName] = useState('');

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('@BudgetApp:token')}`,
    'Content-Type': 'application/json'
  });

  const fetchEmails = async () => {
    try {
      const r = await fetch(`${API_URL}/emails`, { headers: getAuthHeader() });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) { 
      setEmails([]); 
      toast.error("Erro ao carregar lista de e-mails.");
    }
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleAddEmail = async () => {
    if (!newEmail.includes('@')) return toast.warn("Insira um e-mail válido");
    try {
      const res = await fetch(`${API_URL}/emails`, { 
        method: 'POST', 
        headers: getAuthHeader(), 
        body: JSON.stringify({ email: newEmail }) 
      });
      if (res.ok) {
        setNewEmail('');
        fetchEmails();
        toast.success("E-mail adicionado");
      }
    } catch (err) {
      toast.error("Erro ao adicionar e-mail");
    }
  };

  const triggerCityPopup = () => {
    const selected = emails.filter(e => e.is_selected);
    if (selected.length === 0) return toast.warn("Selecione pelo menos um destinatário!");
    setOpenCityPopup(true);
  };

  const generateAndSendPDF = async () => {
  if (!cityName) return toast.warn("Informe o nome da Unidade/Cidade");
  
  setOpenCityPopup(false);
  setLoading(true);
  
  try {
    // 1. Carrega o PDF padrão da pasta public
    const url = '/template.pdf'; 
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const externalDoc = await PDFDocument.load(existingPdfBytes);
    
    // 2. Cria um NOVO documento onde colaremos apenas as páginas desejadas
    const pdfDoc = await PDFDocument.create();
    
    // 3. Seleciona as páginas que queremos manter
    // Se o original tem 13 páginas e queremos tirar a 8 e a 9:
    // Mantemos: 1-7 (índices 0-6) e 10 até o fim (índices 9 em diante)
    const pageIndicesToKeep = [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12]; // Ajuste conforme o total de páginas
    
    const copiedPages = await pdfDoc.copyPages(externalDoc, pageIndicesToKeep);
    copiedPages.forEach((page) => pdfDoc.addPage(page));

    // --- ÁREA PREPARADA PARA VARIÁVEIS ---
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; // Capa
    const { height } = firstPage.getSize();

    // Exemplo de como mudaremos a Unidade na Capa (ajustaremos X e Y depois)
    firstPage.drawText(`UNIDADE: ${cityName.toUpperCase()}`, {
      x: 20, 
      y: height - 125, 
      size: 14,
      color: rgb(0.57, 0, 1), // Roxo #9100ff
    });
    // ---------------------------------------

    // 4. Finalização e Envio
    const pdfBytes = await pdfDoc.save();
    
    // Converte para Base64
    const base64String = btoa(
      new Uint8Array(pdfBytes)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const pdfBase64 = `data:application/pdf;base64,${base64String}`;

    const res = await fetch(`${API_URL}/send-budget`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ 
        pdfBase64, 
        recipients: emails.filter(e => e.is_selected).map(e => e.email) 
      }),
    });

    if (res.ok) {
      toast.success("PDF editado (páginas removidas) e enviado!");
    } else {
      throw new Error();
    }

  } catch (err) {
    console.error(err);
    toast.error("Erro ao processar o template do PDF.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2, borderTop: '5px solid #9100ff' }}>
      <ToastContainer position="top-right" />
      
      <Dialog open={openCityPopup} onClose={() => !loading && setOpenCityPopup(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: 'Conthrax', color: '#9100ff' }}>Personalizar Proposta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Informe o nome da <b>Unidade/Cidade</b> para a capa do PDF:</Typography>
          <TextField
            autoFocus fullWidth variant="outlined" label="Cidade"
            value={cityName} onChange={(e) => setCityName(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCityPopup(false)} color="inherit" disabled={loading}>Cancelar</Button>
          <Button onClick={generateAndSendPDF} variant="contained" disabled={!cityName || loading} sx={{ bgcolor: '#9100ff' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Gerar e Enviar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax', fontSize: '1.2rem' }}>
        Disparo de Proposta Institucional
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField 
          fullWidth size="small" label="E-mail" 
          value={newEmail} onChange={e => setNewEmail(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
        />
        <Button variant="contained" onClick={handleAddEmail} sx={{ bgcolor: '#9100ff' }}>
          <AddIcon />
        </Button>
      </Box>

      <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #eee' }}>
        {emails.length === 0 ? (
          <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center' }}>Nenhum e-mail cadastrado</Typography>
        ) : (
          emails.map(e => (
            <ListItem key={e.id} sx={{ py: 0, borderBottom: '1px solid #f0f0f0' }}>
              <Checkbox checked={e.is_selected} onChange={async () => {
                 await fetch(`${API_URL}/emails/${e.id}`, { 
                   method: 'PATCH', 
                   headers: getAuthHeader(), 
                   body: JSON.stringify({is_selected: !e.is_selected}) 
                 });
                 fetchEmails();
              }} />
              <ListItemText primary={e.email} primaryTypographyProps={{ fontSize: '0.9rem' }} />
              <IconButton onClick={async () => {
                await fetch(`${API_URL}/emails/${e.id}`, { method: 'DELETE', headers: getAuthHeader() });
                fetchEmails();
              }}><DeleteIcon color="error" fontSize="small" /></IconButton>
            </ListItem>
          ))
        )}
      </List>

      <Button 
        fullWidth variant="contained" 
        disabled={loading || emails.filter(e => e.is_selected).length === 0} 
        onClick={triggerCityPopup}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        sx={{ 
          bgcolor: '#9100ff', 
          py: 2, 
          fontWeight: 'bold', 
          fontSize: '1rem',
          '&:hover': { bgcolor: '#7a00d6' }
        }}
      >
        {loading ? "PROCESSANDO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};