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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const PURPLE: [number, number, number] = [145, 0, 255]; 
      const DARK_TEXT: [number, number, number] = [40, 40, 40];
      const GRAY_TEXT: [number, number, number] = [100, 100, 100];

      const applyPageLayout = (pageNum: number) => {
        doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.rect(0, 0, 6, pageHeight, 'F');
        doc.setFontSize(10);
        doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.setFont("helvetica", "bold");
        doc.text("DESENVOLVE", pageWidth - 35, 15);
        doc.setFontSize(8);
        doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
        doc.setFont("helvetica", "normal");
        doc.text(`PRODEMGE DESENVOLVE | UNIDADE: ${cityName.toUpperCase()}`, 15, pageHeight - 10);
        doc.text(`${pageNum}`, pageWidth - 15, pageHeight - 10);
      };

      // PÁGINA 1: CAPA
      applyPageLayout(1);
      doc.setFontSize(28);
      doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.setFont("helvetica", "bold");
      doc.text("SIMULAÇÃO DE VALORES E", 20, 85);
      doc.text("COTAÇÃO INICIAL", 20, 98);
      doc.setFontSize(16);
      doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text("PROJETO DESENVOLVE – PRODEMGE", 20, 115);
      doc.setFontSize(14);
      doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text(`UNIDADE: ${cityName.toUpperCase()}`, 20, 125);
      doc.setFontSize(10);
      doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
      doc.text("Programa de Desenvolvimento Econômico e Transformação Social", 20, 135);

      // PÁGINA 2: CONTEXTUALIZAÇÃO
      doc.addPage();
      applyPageLayout(2);
      doc.setFontSize(18); doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text("Contextualização", 20, 35);
      doc.setFontSize(12); doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text("Propósito do Investimento", 20, 45);
      doc.setFontSize(10); doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
      const ctxText = "O PRODEMGE DESENVOLVE é um programa de governo estratégico, voltado para o Desenvolvimento Econômico e a Transformação Social dos municípios mineiros.\n\nAtravés da parceria estratégica entre PRODEMGE e PECC (Contrato 002/2025), a iniciativa visa qualificar o capital humano para as demandas reais do mercado de tecnologia, conectando o cidadão a oportunidades concretas de geração de renda.";
      doc.text(doc.splitTextToSize(ctxText, pageWidth - 45), 20, 55);

      // PÁGINA 8: DIMENSIONAMENTO FINANCEIRO
      doc.addPage();
      applyPageLayout(8);
      doc.setFontSize(18); doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text("Dimensionamento Financeiro", 20, 35);
      doc.setFontSize(10); doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text(`Cotação estruturada para a Unidade ${cityName}:`, 20, 45);

      autoTable(doc, {
        startY: 52,
        head: [['Descrição do Investimento', 'Referência', 'Total (R$)']],
        body: [
          ['Alunos Beneficiados', `${calculatedStudents}`, '-'],
          ['Investimento Total do Projeto', '-', `R$ ${formatNumber(totalCost)}`],
          ['Adesão (Entrada em 30 dias)', '1x', `R$ ${formatNumber(entryFee)}`],
          ['Taxa de Implantação (60 dias)', '1x', `R$ ${formatNumber(deliveryFee)}`],
          ['Mensalidade Operacional', `${totalMonthlyParcels}x`, `R$ ${formatNumber(monthlyPayment)}`],
        ],
        headStyles: { fillColor: PURPLE, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 2: { halign: 'right' } }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12); doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text("Cronograma de Desembolso por Exercício", 20, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Ano Exercício', 'Nº de Parcelas', 'Subtotal Anual (R$)']],
        body: yearlyPayments.map(p => [p.year, `${p.months} meses`, `R$ ${formatNumber(p.total)}`]),
        headStyles: { fillColor: [80, 80, 80] },
        styles: { fontSize: 9 },
        columnStyles: { 2: { halign: 'right' } }
      });

      const pdfBase64 = doc.output('datauristring');

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ 
          pdfBase64, 
          recipients: emails.filter(e => e.is_selected).map(e => e.email) 
        }),
      });

      if (res.ok) {
        toast.success("PDF Institucional enviado com sucesso!");
      } else {
        throw new Error();
      }

    } catch (err) {
      toast.error("Falha ao gerar ou enviar o PDF.");
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