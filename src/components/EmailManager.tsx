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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  calculatedStudents, totalCost, formatNumber, yearlyPayments, totalMonthlyParcels
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
    if (!cityName) return toast.warn("Informe a cidade");
    setOpenCityPopup(false);
    setLoading(true);
    
    try {
      const url = '/template.pdf'; 
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
      
      // LOGICA DA LOGO: Carrega a imagem da pasta public
      const logoDevBytes = await fetch('/logo-desenvolve.png').then(res => res.arrayBuffer());
      
      const externalDoc = await PDFDocument.load(existingPdfBytes);
      const pdfDoc = await PDFDocument.create();
      
      // LOGICA DA LOGO: Transforma em imagem do PDF
      const logoDevImg = await pdfDoc.embedPng(logoDevBytes);
      
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const PURPLE = rgb(0.57, 0, 1);
      const GRAY = rgb(0.4, 0.4, 0.4);
      const BLACK = rgb(0, 0, 0);

      // --- PÁGINA 1: CAPA (LANDSCAPE) ---
      const p1 = pdfDoc.addPage([841.89, 595.28]);
      
      // LOGICA DA LOGO: Desenha a logo no lugar do texto roxo "DESENVOLVE"
      p1.drawImage(logoDevImg, { x: 50, y: 480, width: 200, height: 40 }); 
      
      p1.drawText('SIMULAÇÃO DE VALORES E COTAÇÃO', { x: 50, y: 430, size: 36, font: fontBold });
      p1.drawText('INICIAL', { x: 50, y: 395, size: 36, font: fontBold });
      p1.drawText('PROJETO DESENVOLVE – PRODEMGE', { x: 50, y: 310, size: 20, font: fontBold });
      p1.drawText(`UNIDADE: ${cityName.toUpperCase()}`, { x: 50, y: 270, size: 16, font: fontBold, color: PURPLE });
      p1.drawText('Programa de Desenvolvimento Econômico e Transformação Social', { x: 50, y: 245, size: 12, font: fontReg, color: BLACK });

      // --- PÁGINA 2: INSTITUCIONAL (COPIADA) ---
      const [page2] = await pdfDoc.copyPages(externalDoc, [1]);
      pdfDoc.addPage(page2);

      // --- PÁGINA 3: DIMENSIONAMENTO (LANDSCAPE - SEM QUADRO, SEM CICLOS) ---
      const p3 = pdfDoc.addPage([841.89, 595.28]);
      p3.drawText('Dimensionamento', { x: 50, y: 510, size: 18, font: fontBold, color: PURPLE });
      p3.drawText('Trajetórias de Transformação', { x: 50, y: 460, size: 32, font: fontBold });
      
      const desc3 = `A implementação em ${cityName} está desenhada para um impacto de larga escala, estruturada para atender ao volume de demanda do município de forma organizada e sustentável.`;
      p3.drawText(desc3, { x: 50, y: 430, size: 14, font: fontReg, maxWidth: 700 });

      p3.drawText('Público Beneficiário', { x: 50, y: 360, size: 18, font: fontBold });
      p3.drawText(`Total de Cidadãos: ${calculatedStudents.toLocaleString('pt-BR')}`, { x: 50, y: 330, size: 22, font: fontBold, color: PURPLE });

      p3.drawText('Responsabilidade Municipal', { x: 50, y: 260, size: 18, font: fontBold });
      const respText = `Fornecimento de espaço físico adequado para credenciamento e funcionamento da "Unidade Polo" da Escola Desenvolve, servindo como centro de referência e apoio aos alunos.`;
      p3.drawText(respText, { x: 50, y: 235, size: 14, font: fontReg, maxWidth: 650, lineHeight: 18 });

      // --- PÁGINA 4: INSTITUCIONAL (COPIADA) ---
      const [page4] = await pdfDoc.copyPages(externalDoc, [3]);
      pdfDoc.addPage(page4);

      const p5 = pdfDoc.addPage([841.89, 595.28]);
      const unitCost = totalCost / calculatedStudents;
      const globalValue = totalCost >= 1000000 ? `${(totalCost/1000000).toFixed(2)}M` : formatNumber(totalCost);

      p5.drawText('Engenharia Financeira', { x: 50, y: 510, size: 18, font: fontBold, color: PURPLE });
      p5.drawText('Estrutura de Investimento Social', { x: 50, y: 460, size: 32, font: fontBold });
      
      // NOVO TEXTO ADICIONADO ABAIXO DO TÍTULO
      p5.drawText('A engenharia financeira prevê o escalonamento das fases para otimização orçamentária.', { 
        x: 50, 
        y: 420, 
        size: 18, 
        font: fontReg, 
        color: BLACK 
      });

      // Layout de Colunas (Ajustado levemente o Y para não sobrepor o novo texto)
      const drawCol = (val: string, label: string, sub: string, x: number) => {
        p5.drawText(val, { x, y: 340, size: 40, font: fontBold, color: PURPLE });
        p5.drawText(label, { x, y: 300, size: 16, font: fontBold });
        p5.drawText(sub, { x, y: 280, size: 11, font: fontReg, color: GRAY });
      };

      drawCol(`R$ ${formatNumber(unitCost)}`, 'Investimento Unitário', 'Por cidadão beneficiado', 50);
      drawCol(`${calculatedStudents.toLocaleString('pt-BR')}`, 'Total de Cidadãos', 'Cidadãos Beneficiados', 340);
      drawCol(`R$ ${globalValue}`, 'Investimento Global', 'Valor total do projeto', 600);

// --- PÁGINA 7: PREVISÃO ORÇAMENTÁRIA (DADOS REAIS) ---
      const p7 = pdfDoc.addPage([841.89, 595.28]);
      
      p7.drawText('DESENVOLVE', { x: 50, y: 520, size: 18, font: fontBold, color: PURPLE });
      p7.drawText('Previsão Orçamentária', { x: 50, y: 480, size: 32, font: fontBold });
      p7.drawText('Distribuição por Exercício Fiscal', { x: 50, y: 445, size: 18, font: fontBold });
      p7.drawText('Planejamento financeiro dividido por ano para facilitar o processo orçamentário municipal.', { x: 50, y: 420, size: 12, font: fontReg, color: GRAY });

      // Listagem dos Anos com Dados Reais
      let currentY = 350;
      yearlyPayments.forEach((item: any) => {
        p7.drawText(`• Ano ${item.year}: R$ ${formatNumber(item.total)}`, {
          x: 70,
          y: currentY,
          size: 16,
          font: fontBold,
          color: rgb(0, 0, 0)
        });
        currentY -= 30;
      });

      const totalExecucao = `Total de ${totalMonthlyParcels + 2} meses de execução, com valores calculados com base no cronograma de desembolso real.`;
      p7.drawText(totalExecucao, { x: 50, y: currentY - 20, size: 12, font: fontReg, color: GRAY });

      // --- PÁGINAS FINAIS (COPIADAS) ---
      const finalIndices = [5, 6, 9]; // Cronograma, Previsão e Nota Jurídica
      const copiedFinals = await pdfDoc.copyPages(externalDoc, finalIndices);
      copiedFinals.forEach(p => pdfDoc.addPage(p));

      // --- ENVIO ---
      const pdfBytes = await pdfDoc.save();
      const base64String = btoa(new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      const pdfBase64 = `data:application/pdf;base64,${base64String}`;

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ pdfBase64, recipients: emails.filter(e => e.is_selected).map(e => e.email) }),
      });

      if (res.ok) toast.success("PDF enviado com sucesso!");
      else throw new Error();

    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
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
          <TextField autoFocus fullWidth variant="outlined" label="Cidade" value={cityName} onChange={(e) => setCityName(e.target.value)} disabled={loading} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCityPopup(false)} color="inherit" disabled={loading}>Cancelar</Button>
          <Button onClick={generateAndSendPDF} variant="contained" disabled={!cityName || loading} sx={{ bgcolor: '#9100ff' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Gerar e Enviar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax', fontSize: '1.1rem' }}>Disparo de Proposta Institucional</Typography>
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

      <Button fullWidth variant="contained" disabled={loading || emails.filter(e => e.is_selected).length === 0} onClick={triggerCityPopup} startIcon={<SendIcon />} sx={{ bgcolor: '#9100ff', py: 2, fontWeight: 'bold' }}>
        {loading ? "GERANDO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};