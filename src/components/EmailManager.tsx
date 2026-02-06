import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Checkbox, IconButton, List, ListItem, ListItemText, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'https://budget-calculator-zntc.onrender.com';

// Interface para receber os dados da calculadora
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
  calculatedStudents,
  totalCost,
  entryFee,
  deliveryFee,
  monthlyPayment,
  totalMonthlyParcels,
  yearlyPayments,
  formatNumber
}) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('@BudgetApp:token')}`,
    'Content-Type': 'application/json'
  });

  const fetchEmails = async () => {
    try {
      const r = await fetch(`${API_URL}/emails`, { headers: getAuthHeader() });
      const data = await r.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      setEmails([]);
    }
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) return toast.error("E-mail inválido");
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
    if (selected.length === 0) return toast.warn("Selecione ao menos um destinatário!");

    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- DESIGN DO PDF (ESTILO PRODEMGE/INSTITUCIONAL) ---
      
      // Cabeçalho Roxo
      doc.setFillColor(145, 0, 255); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("PROPOSTA DE INVESTIMENTO", 15, 25);
      
      // Detalhes da Proposta
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 50);
      doc.text(`Projeto: Modernização Tecnológica Educacional`, 15, 55);

      // Tabela Principal de Valores
      autoTable(doc, {
        startY: 65,
        head: [['Descrição do Item', 'Quantidade / Parcelas', 'Valor Total (R$)']],
        body: [
          ['Total de Alunos Calculados', `${calculatedStudents}`, '-'],
          ['Valor de Investimento Total', '-', `R$ ${formatNumber(totalCost)}`],
          ['Entrada (Adesão)', '1x', `R$ ${formatNumber(entryFee)}`],
          ['Taxa de Entrega / Implantação', '1x', `R$ ${formatNumber(deliveryFee)}`],
          ['Mensalidades Restantes', `${totalMonthlyParcels}x`, `R$ ${formatNumber(monthlyPayment)}`],
        ],
        headStyles: { fillColor: [145, 0, 255], halign: 'center' },
        columnStyles: { 2: { halign: 'right' } },
        styles: { font: 'helvetica', fontSize: 10 }
      });

      // Cronograma por Exercício (Página de Valores)
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo de Desembolso por Exercício", 15, finalY + 15);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Ano Exercício', 'Nº de Meses', 'Valor Total do Ano (R$)']],
        body: yearlyPayments.map(p => [
          p.year.toString(),
          `${p.months} meses`,
          `R$ ${formatNumber(p.total)}`
        ]),
        headStyles: { fillColor: [80, 80, 80], halign: 'center' },
        columnStyles: { 2: { halign: 'right' } },
        theme: 'grid'
      });

      // Rodapé
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Documento gerado automaticamente pelo sistema de orçamentos.", 15, 285);

      const pdfBase64 = doc.output('datauristring');

      // Envio via API (Resend no Backend)
      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ pdfBase64, recipients: selected }),
      });

      if (res.ok) toast.success("E-mail enviado com sucesso!");
      else toast.error("Erro no servidor de e-mail.");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar ou enviar PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2, borderTop: '4px solid #9100ff' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax', color: '#333' }}>
        Disparo de Orçamento
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField 
          fullWidth size="small" 
          label="Novo e-mail de destino"
          value={newEmail} 
          onChange={e => setNewEmail(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddEmail} sx={{ bgcolor: '#9100ff' }}>
          <AddIcon />
        </Button>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Selecione os destinatários:</Typography>
      <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #eee' }}>
        {emails.length > 0 ? emails.map(e => (
          <ListItem key={e.id} divider sx={{ py: 0 }}>
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
              await fetch(`${API_URL}/emails/${e.id}`, { method: 'DELETE', headers: getAuthHeader() });
              fetchEmails();
            }}><DeleteIcon color="error" /></IconButton>
          </ListItem>
        )) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: '#999' }}>Nenhum e-mail disponível.</Typography>
        )}
      </List>

      <Button 
        fullWidth variant="contained" 
        disabled={loading || emails.filter(e => e.is_selected).length === 0} 
        onClick={handleSendPDF} 
        startIcon={<SendIcon />}
        sx={{ mt: 3, bgcolor: '#9100ff', py: 1.5, fontWeight: 'bold' }}
      >
        {loading ? "ENVIANDO..." : "ENVIAR ORÇAMENTO POR E-MAIL"}
      </Button>
    </Paper>
  );
};