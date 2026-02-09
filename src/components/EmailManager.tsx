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
    if (emails.filter(e => e.is_selected).length === 0) return toast.warn("Selecione os destinatários!");
    setOpenCityPopup(true);
  };

  const generateAndSendPDF = async () => {
    if (!cityName) return toast.warn("Informe o nome da Unidade/Cidade");
    setOpenCityPopup(false);
    setLoading(true);
    
    try {
      const existingPdfBytes = await fetch('/template.pdf').then(res => res.arrayBuffer());
      const externalDoc = await PDFDocument.load(existingPdfBytes);
      const pdfDoc = await PDFDocument.create();
      
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const PURPLE = rgb(0.57, 0, 1);
      const GRAY = rgb(0.4, 0.4, 0.4);

      // --- PÁGINA 1: CAPA (CONSTRUÍDA DO ZERO) ---
      const page1 = pdfDoc.addPage([841.89, 595.28]); // Paisagem conforme imagem
      page1.drawText('DESENVOLVE', { x: 50, y: 500, size: 24, font: fontBold, color: GRAY });
      page1.drawText('SIMULAÇÃO DE VALORES E COTAÇÃO', { x: 50, y: 400, size: 38, font: fontBold });
      page1.drawText('INICIAL', { x: 50, y: 350, size: 38, font: fontBold });
      page1.drawText('PROJETO DESENVOLVE – PRODEMGE', { x: 50, y: 280, size: 22, font: fontBold });
      page1.drawText(`UNIDADE: ${cityName.toUpperCase()}`, { x: 50, y: 220, size: 14, font: fontBold });
      page1.drawText('Programa de Desenvolvimento Econômico e Transformação Social', { x: 50, y: 190, size: 12, font: fontReg });

      // --- PÁGINA 2: INSTITUCIONAL (COPIADA) ---
      const [instPage2] = await pdfDoc.copyPages(externalDoc, [1]);
      pdfDoc.addPage(instPage2);

      // --- PÁGINA 3: DIMENSIONAMENTO (CONSTRUÍDA DO ZERO) ---
      const page3 = pdfDoc.addPage([841.89, 595.28]);
      page3.drawText('Dimensionamento', { x: 50, y: 500, size: 18, font: fontBold, color: PURPLE });
      page3.drawText('Trajetórias de Transformação', { x: 50, y: 460, size: 28, font: fontBold });
      
      const dimText = `A implementação em ${cityName} está desenhada para um impacto de larga escala, estruturada para atender ao volume de demanda do município de forma organizada e sustentável.`;
      page3.drawText(dimText, { x: 50, y: 410, size: 14, font: fontReg, maxWidth: 700 });

      page3.drawText('Público Beneficiário', { x: 50, y: 340, size: 16, font: fontBold });
      page3.drawText(`${calculatedStudents.toLocaleString('pt-BR')} cidadãos divididos em dois ciclos:`, { x: 50, y: 310, size: 14, font: fontReg });
      page3.drawText(`• Fase 1: ${(calculatedStudents/2).toLocaleString('pt-BR')} participantes`, { x: 70, y: 280, size: 12, font: fontReg });
      page3.drawText(`• Fase 2: ${(calculatedStudents/2).toLocaleString('pt-BR')} participantes`, { x: 70, y: 260, size: 12, font: fontReg });

      // Box roxo de bônus
      page3.drawRectangle({ x: 500, y: 180, width: 300, height: 150, color: rgb(0.9, 0.8, 1) });
      page3.drawText('36 meses de formação', { x: 520, y: 300, size: 14, font: fontBold });
      page3.drawText('Ao optar por uma das trilhas diplomadoras, o cidadão garante a extensão do seu ciclo de formação para até 36 meses, sem custos adicionais ao município.', { x: 520, y: 280, size: 11, font: fontReg, maxWidth: 260 });

      // --- PÁGINA 4: INSTITUCIONAL (COPIADA) ---
      const [instPage4] = await pdfDoc.copyPages(externalDoc, [3]);
      pdfDoc.addPage(instPage4);

      // --- PÁGINA 5: ENGENHARIA FINANCEIRA (CONSTRUÍDA DO ZERO) ---
      const page5 = pdfDoc.addPage([841.89, 595.28]);
      page5.drawText('Engenharia Financeira', { x: 50, y: 500, size: 18, font: fontBold, color: PURPLE });
      page5.drawText('Estrutura de Investimento Social', { x: 50, y: 460, size: 28, font: fontBold });
      
      const unitCost = totalCost / calculatedStudents;

      // Coluna 1: Investimento Unitário
      page5.drawText(`R$ ${formatNumber(unitCost)}`, { x: 50, y: 350, size: 42, font: fontBold });
      page5.drawText('Investimento Unitário', { x: 50, y: 310, size: 16, font: fontBold });
      page5.drawText('Por cidadão beneficiado', { x: 50, y: 285, size: 12, font: fontReg });

      // Coluna 2: Total de Cidadãos
      page5.drawText(calculatedStudents.toLocaleString('pt-BR'), { x: 350, y: 350, size: 42, font: fontBold });
      page5.drawText('Total de Cidadãos', { x: 350, y: 310, size: 16, font: fontBold });
      page5.drawText('Divididos em duas fases', { x: 350, y: 285, size: 12, font: fontReg });

      // Coluna 3: Investimento Global
      const globalValue = totalCost >= 1000000 ? `${(totalCost/1000000).toFixed(1)}M` : formatNumber(totalCost);
      page5.drawText(`R$ ${globalValue}`, { x: 620, y: 350, size: 42, font: fontBold });
      page5.drawText('Investimento Global', { x: 620, y: 310, size: 16, font: fontBold });
      page5.drawText('Valor total do projeto', { x: 620, y: 285, size: 12, font: fontReg });

      // --- PÁGINAS FINAIS: CRONOGRAMA E NOTA JURÍDICA (COPIADAS) ---
      // Copiamos as páginas originais 6, 7 e 10 (ajustando índices conforme as páginas que restaram)
      const finalIndices = [5, 6, 9]; 
      const copiedFinalPages = await pdfDoc.copyPages(externalDoc, finalIndices);
      copiedFinalPages.forEach(p => pdfDoc.addPage(p));

      // --- SALVAR E ENVIAR ---
      const pdfBytes = await pdfDoc.save();
      const base64String = btoa(new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      const pdfBase64 = `data:application/pdf;base64,${base64String}`;

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ pdfBase64, recipients: emails.filter(e => e.is_selected).map(e => e.email) }),
      });

      if (res.ok) toast.success("Proposta Híbrida enviada!");
      else throw new Error();

    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar o PDF customizado.");
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
        {loading ? "GERANDO DOCUMENTO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};