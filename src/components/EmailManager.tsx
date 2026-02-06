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
    const selected = emails.filter(e => e.is_selected);
    if (selected.length === 0) return toast.warn("Selecione os destinatários!");
    setOpenCityPopup(true);
  };

  const generateAndSendPDF = async () => {
    setOpenCityPopup(false);
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const PURPLE: [number, number, number] = [145, 0, 255]; // Roxo Desenvolve
      const DARK_TEXT: [number, number, number] = [40, 40, 40];
      const GRAY_TEXT: [number, number, number] = [100, 100, 100];

      // Função Auxiliar para Layout de cada página
      const applyPageLayout = (pageNum: number) => {
        // Barra Lateral Roxa (Marca Registrada do PDF)
        doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.rect(0, 0, 6, pageHeight, 'F');
        
        // Marca d'água/Texto de Topo
        doc.setFontSize(10);
        doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.setFont("helvetica", "bold");
        doc.text("DESENVOLVE", pageWidth - 35, 15);

        // Rodapé com numeração e cidade
        doc.setFontSize(8);
        doc.setTextColor(GRAY_TEXT[0]);
        doc.setFont("helvetica", "normal");
        doc.text(`PRODEMGE DESENVOLVE | UNIDADE: ${cityName.toUpperCase()}`, 15, pageHeight - 10);
        doc.text(`${pageNum}`, pageWidth - 15, pageHeight - 10);
      };

      // --- PÁGINA 1: CAPA (FIEL AO MODELO) ---
      applyPageLayout(1);
      doc.setFontSize(28);
      doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.setFont("helvetica", "bold");
      doc.text("SIMULAÇÃO DE VALORES E", 20, 85);
      doc.text("COTAÇÃO INICIAL", 20, 98);

      doc.setFontSize(16);
      doc.setTextColor(DARK_TEXT[0]);
      doc.text("PROJETO DESENVOLVE – PRODEMGE", 20, 115);
      
      doc.setFontSize(14);
      doc.setTextColor(PURPLE[0]);
      doc.text(`UNIDADE: ${cityName.toUpperCase()}`, 20, 125);

      doc.setFontSize(10);
      doc.setTextColor(GRAY_TEXT[0]);
      doc.text("Programa de Desenvolvimento Econômico e Transformação Social", 20, 135);

      // --- PÁGINA 2: CONTEXTUALIZAÇÃO ---
      doc.addPage();
      applyPageLayout(2);
      doc.setFontSize(18); doc.setTextColor(PURPLE[0]);
      doc.text("Contextualização", 20, 35);
      doc.setFontSize(12); doc.setTextColor(DARK_TEXT[0]);
      doc.text("Propósito do Investimento", 20, 45);
      
      doc.setFontSize(10); doc.setTextColor(GRAY_TEXT[0]);
      const ctxText = "O PRODEMGE DESENVOLVE é um programa de governo estratégico, voltado para o Desenvolvimento Econômico e a Transformação Social dos municípios mineiros.\n\nAtravés da parceria estratégica entre PRODEMGE e PECC (Contrato 002/2025), a iniciativa visa qualificar o capital humano para as demandas reais do mercado de tecnologia, conectando o cidadão a oportunidades concretas de geração de renda.";
      doc.text(doc.splitTextToSize(ctxText, pageWidth - 45), 20, 55);

      // --- PÁGINA 3: FUNDAMENTAÇÃO LEGAL ---
      doc.addPage();
      applyPageLayout(3);
      doc.setFontSize(18); doc.text("Fundamentação", 20, 35);
      doc.setFontSize(11); doc.setTextColor(DARK_TEXT[0]);
      doc.text("Segurança Jurídica e Institucional", 20, 45);
      doc.setFontSize(10); doc.setTextColor(GRAY_TEXT[0]);
      const fundText = "• Lei Federal nº 14.133/2021: Art. 75, inciso IX\n• RICON da PRODEMGE: Regulamento Interno de Celebração de Oportunidades de Negócios\n• Contratação direta: Via Companhia de Tecnologia do Estado\n\nA PRODEMGE garante conformidade absoluta com os órgãos de controle através de rito processual estruturado.";
      doc.text(doc.splitTextToSize(fundText, pageWidth - 45), 20, 55);

      // Páginas 4 a 7 (Padrão Institucional)
      for(let i=4; i<=7; i++) {
        doc.addPage();
        applyPageLayout(i);
        doc.setFontSize(18); doc.text(`Governança e Entrega - Fase ${i-3}`, 20, 35);
        doc.setFontSize(10);
        doc.text("Monitoramento contínuo de indicadores e validação documental de conformidade.", 20, 45);
      }

      // --- PÁGINA 8: DIMENSIONAMENTO FINANCEIRO (VALORES DA CALCULADORA) ---
      doc.addPage();
      applyPageLayout(8);
      doc.setFontSize(18); doc.setTextColor(PURPLE[0]);
      doc.text("Dimensionamento Financeiro", 20, 35);
      doc.setFontSize(10); doc.setTextColor(DARK_TEXT[0]);
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

      // Tabela de Exercícios
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12); doc.text("Cronograma de Desembolso por Exercício", 20, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Ano Exercício', 'Nº de Parcelas', 'Subtotal Anual (R$)']],
        body: yearlyPayments.map(p => [p.year, `${p.months} meses`, `R$ ${formatNumber(p.total)}`]),
        headStyles: { fillColor: [80, 80, 80] },
        styles: { fontSize: 9 },
        columnStyles: { 2: { halign: 'right' } }
      });

      // --- PÁGINA 9: NOTA JURÍDICA ---
      doc.addPage();
      applyPageLayout(9);
      doc.setFontSize(18); doc.text("Nota Jurídica", 20, 35);
      doc.setFontSize(9); doc.setTextColor(GRAY_TEXT[0]);
      const notaJuridica = "Este documento constitui-se exclusivamente como uma Simulação de Valores e Cotação Inicial, possuindo caráter meramente informativo e referencial para discussões internas e análise de possibilidades orçamentárias.\n\nO presente instrumento não gera obrigações contratuais e não possui validade legal como contrato de prestação de serviços. Todas as condições aqui apresentadas estão sujeitas a alterações e deverão ser ratificadas em instrumento contratual formal.";
      doc.text(doc.splitTextToSize(notaJuridica, pageWidth - 45), 20, 50);

      // --- PÁGINA 10: PRÓXIMOS PASSOS ---
      doc.addPage();
      applyPageLayout(10);
      doc.setFontSize(18); doc.text("Próximos Passos", 20, 35);
      doc.setFontSize(11); doc.setTextColor(DARK_TEXT[0]);
      doc.text("Para avançar com a formalização da Unidade:", 20, 50);
      doc.setFontSize(10);
      doc.text("1. Manifestação de interesse formal via ofício.\n2. Emissão do Plano de Trabalho Definitivo pela PRODEMGE.\n3. Envio de solicitação para: negocios@prodemge.com.br", 20, 60);

      const pdfBase64 = doc.output('datauristring');

      // Envio
      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ 
          pdfBase64, 
          recipients: emails.filter(e => e.is_selected).map(e => e.email) 
        }),
      });

      if (res.ok) toast.success("PDF Institucional enviado com sucesso!");
      else toast.error("Falha no envio.");

    } catch (err) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2, borderTop: '5px solid #9100ff' }}>
      <ToastContainer position="top-right" />
      
      <Dialog open={openCityPopup} onClose={() => setOpenCityPopup(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: 'Conthrax', color: '#9100ff' }}>Personalizar Proposta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Informe o nome da <b>Unidade/Cidade</b> para a capa do PDF:</Typography>
          <TextField
            autoFocus fullWidth variant="outlined" label="Cidade"
            value={cityName} onChange={(e) => setCityName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCityPopup(false)} color="inherit">Cancelar</Button>
          <Button onClick={generateAndSendPDF} variant="contained" disabled={!cityName} sx={{ bgcolor: '#9100ff' }}>
            Gerar e Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax', fontSize: '1.2rem' }}>
        Disparo de Proposta Institucional
      </Typography>
      
      {/* Restante do JSX de lista de emails (manteve o padrão funcional) */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField fullWidth size="small" label="E-mail" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <Button variant="contained" onClick={async () => {
          await fetch(`${API_URL}/emails`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ email: newEmail }) });
          setNewEmail(''); fetchEmails();
        }} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 150, overflow: 'auto', mb: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
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
        sx={{ bgcolor: '#9100ff', py: 2, fontWeight: 'bold', fontSize: '1rem' }}
      >
        {loading ? "GERANDO DOCUMENTO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};