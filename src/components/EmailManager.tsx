import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Checkbox, IconButton, 
  List, ListItem, ListItemText, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  calculatedStudents, totalCost, entryFee, deliveryFee, 
  monthlyPayment, totalMonthlyParcels, yearlyPayments, formatNumber
}) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para o Popup da Cidade
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

  // 1. Aciona o Popup antes de gerar o PDF
  const triggerCityPopup = () => {
    const selected = emails.filter(e => e.is_selected);
    if (selected.length === 0) return toast.warn("Selecione os destinatários!");
    setOpenCityPopup(true);
  };

  // 2. Gera o PDF Institucional com os dados e a Cidade
  const generateAndSendPDF = async () => {
    setOpenCityPopup(false);
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const PURPLE: [number, number, number] = [145, 0, 255];
      const GREY: [number, number, number] = [80, 80, 80];

      const addLayout = (pageNum: number) => {
        doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.rect(0, 0, 4, pageHeight, 'F'); // Borda lateral esquerda
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`PRODEMGE DESENVOLVE | ${cityName.toUpperCase()}`, 10, pageHeight - 10);
        doc.text(`${pageNum}`, pageWidth - 15, pageHeight - 10);
      };

      // --- PÁGINA 1: CAPA ---
      addLayout(1);
      doc.setFontSize(26);
      doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text("SIMULAÇÃO DE VALORES E", 20, 80);
      doc.text("COTAÇÃO INICIAL", 20, 92);
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("PROJETO DESENVOLVE – PRODEMGE", 20, 110);
      doc.setFontSize(14);
      doc.text(`UNIDADE: ${cityName.toUpperCase()}`, 20, 120);

      // --- PÁGINA 2: CONTEXTUALIZAÇÃO ---
      doc.addPage();
      addLayout(2);
      doc.setFontSize(18); doc.text("Contextualização", 20, 30);
      doc.setFontSize(11);
      const ctxText = "O PRODEMGE DESENVOLVE é um programa de governo estratégico, voltado para o Desenvolvimento Econômico e a Transformação Social dos municípios mineiros.";
      doc.text(doc.splitTextToSize(ctxText, pageWidth - 40), 20, 45);

      // --- PÁGINA 3 A 7: (PULADO PARA EXEMPLO, SEGUE PADRÃO) ---
      for(let i=3; i<=7; i++) {
        doc.addPage();
        addLayout(i);
        doc.text(`Conteúdo Institucional - Página ${i}`, 20, 30);
      }

      // --- PÁGINA 8-9: REMOVIDAS CONFORME SOLICITADO ---

      // --- PÁGINA 10 (Agora página 8): VALORES DINÂMICOS ---
      doc.addPage();
      addLayout(8);
      doc.setFontSize(18); doc.text("Dimensionamento Financeiro", 20, 30);
      
      autoTable(doc, {
        startY: 45,
        head: [['Descrição', 'Ref/Qtd', 'Total (R$)']],
        body: [
          ['Alunos Beneficiados', `${calculatedStudents}`, '-'],
          ['Investimento Total', '-', `R$ ${formatNumber(totalCost)}`],
          ['Adesão (Entrada)', '1x', `R$ ${formatNumber(entryFee)}`],
          ['Implantação', '1x', `R$ ${formatNumber(deliveryFee)}`],
          ['Mensalidade', `${totalMonthlyParcels}x`, `R$ ${formatNumber(monthlyPayment)}`],
        ],
        headStyles: { fillColor: PURPLE }
      });

      // Cronograma Anual
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      autoTable(doc, {
        startY: finalY,
        head: [['Ano Exercício', 'Meses', 'Subtotal (R$)']],
        body: yearlyPayments.map(p => [p.year, p.months, `R$ ${formatNumber(p.total)}`]),
        headStyles: { fillColor: GREY }
      });

      doc.addPage();
      addLayout(9);
      doc.setFontSize(14); doc.text("Nota Jurídica", 20, 30);
      doc.setFontSize(9);
      doc.text("Este documento possui caráter meramente informativo e não gera obrigações contratuais.", 20, 45);

      const pdfBase64 = doc.output('datauristring');

      // 3. Disparo para o Backend
      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ 
          pdfBase64, 
          recipients: emails.filter(e => e.is_selected).map(e => e.email) 
        }),
      });

      if (res.ok) toast.success("Orçamento enviado para " + cityName);
      else toast.error("Erro no envio.");

    } catch (err) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2, borderTop: '4px solid #9100ff' }}>
      <ToastContainer position="top-right" />
      
      {/* POPUP DE CONFIRMAÇÃO DA CIDADE */}
      <Dialog open={openCityPopup} onClose={() => setOpenCityPopup(false)}>
        <DialogTitle sx={{ fontFamily: 'Conthrax' }}>Confirmar Destino</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para gerar o PDF institucional, informe o nome da cidade:
          </Typography>
          <TextField
            autoFocus fullWidth label="Nome da Cidade"
            value={cityName} onChange={(e) => setCityName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCityPopup(false)}>Cancelar</Button>
          <Button 
            onClick={generateAndSendPDF} 
            variant="contained" 
            disabled={!cityName}
            sx={{ bgcolor: '#9100ff' }}
          >
            Confirmar e Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax' }}>Gestão de Disparo</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField fullWidth size="small" label="Adicionar E-mail" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <Button variant="contained" onClick={async () => {
          await fetch(`${API_URL}/emails`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ email: newEmail }) });
          setNewEmail(''); fetchEmails();
        }} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 150, overflow: 'auto', mb: 2, border: '1px solid #eee' }}>
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
            }}><DeleteIcon color="error" /></IconButton>
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
        {loading ? "PROCESSANDO..." : "ENVIAR PROPOSTA INSTITUCIONAL"}
      </Button>
    </Paper>
  );
};