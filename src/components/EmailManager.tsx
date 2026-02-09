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
import { PDFDocument, rgb } from 'pdf-lib';

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
      const data = await r.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) { setEmails([]); }
  };

  useEffect(() => { fetchEmails(); }, []);

  const triggerCityPopup = () => {
    if (emails.filter(e => e.is_selected).length === 0) return toast.warn("Selecione os destinatários!");
    setOpenCityPopup(true);
  };

  const generateAndSendPDF = async () => {
  if (!cityName) return toast.warn("Informe o nome da Unidade/Cidade");
  setOpenCityPopup(false);
  setLoading(true);
  
  try {
    const url = '/template.pdf'; 
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const externalDoc = await PDFDocument.load(existingPdfBytes);
    
    // Criar novo documento removendo páginas 8 e 9 (índices 7 e 8)
    const pdfDoc = await PDFDocument.create();
    const totalPages = externalDoc.getPageCount();
    const allIndices = Array.from({ length: totalPages }, (_, i) => i);
    const pageIndicesToKeep = allIndices.filter(idx => idx !== 7 && idx !== 8);

    const copiedPages = await pdfDoc.copyPages(externalDoc, pageIndicesToKeep);
    copiedPages.forEach((page) => pdfDoc.addPage(page));

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    
    firstPage.drawRectangle({
      x: 55,           
      y: height - 128, 
      width: 200,      
      height: 30,      
      color: rgb(1, 1, 1), 
    });

    // 2. Escrever a cidade variável
    firstPage.drawText(cityName.toUpperCase(), {
      x: 60, 
      y: height - 120, // Ajuste fino para alinhar com o "UNIDADE:"
      size: 22,
      color: rgb(0.57, 0, 1), // Roxo #9100ff
    });

    // 3. (Opcional) Rodapé ou outras menções de cidade nas páginas internas
    // Se houver "BETIM" em outras páginas, repetimos o processo de máscara + texto

    const pdfBytes = await pdfDoc.save();
    const base64String = btoa(
      new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
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

    if (res.ok) toast.success(`Proposta para ${cityName} enviada!`);
    else throw new Error();

  } catch (err) {
    console.error(err);
    toast.error("Erro ao editar o template.");
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
          <Typography variant="body2" sx={{ mb: 2 }}>Nome da Unidade para o PDF:</Typography>
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

      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax', fontSize: '1.1rem' }}>
        Disparo de Proposta Institucional
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField fullWidth size="small" label="E-mail" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <Button variant="contained" onClick={async () => {
          if(!newEmail) return;
          await fetch(`${API_URL}/emails`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ email: newEmail }) });
          setNewEmail(''); fetchEmails();
        }} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 180, overflow: 'auto', mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        {emails.map(e => (
          <ListItem key={e.id} sx={{ py: 0 }}>
            <Checkbox checked={e.is_selected} onChange={async () => {
               await fetch(`${API_URL}/emails/${e.id}`, { method: 'PATCH', headers: getAuthHeader(), body: JSON.stringify({is_selected: !e.is_selected}) });
               fetchEmails();
            }} />
            <ListItemText primary={e.email} />
            <IconButton onClick={async () => {
              await fetch(`${API_URL}/emails/${e.id}`, { method: 'DELETE', headers: getAuthHeader() });
              fetchEmails();
            }}><DeleteIcon color="error" fontSize="small" /></IconButton>
          </ListItem>
        ))}
      </List>

      <Button 
        fullWidth variant="contained" 
        disabled={loading || emails.filter(e => e.is_selected).length === 0} 
        onClick={triggerCityPopup}
        startIcon={<SendIcon />}
        sx={{ bgcolor: '#9100ff', py: 2, fontWeight: 'bold' }}
      >
        {loading ? "PROCESSANDO PDF..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};