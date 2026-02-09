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
  calculatedStudents, totalCost, formatNumber
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
      // Carregamento dos Assets
      const [pdfBytes, logoTopoBytes, logoDevBytes] = await Promise.all([
        fetch('/template.pdf').then(res => res.arrayBuffer()),
        fetch('/logo-topo.png').then(res => res.arrayBuffer()),
        fetch('/logo-desenvolve.png').then(res => res.arrayBuffer())
      ]);

      const externalDoc = await PDFDocument.load(pdfBytes);
      const pdfDoc = await PDFDocument.create();
      
      // Embed das imagens
      const logoTopoImg = await pdfDoc.embedPng(logoTopoBytes);
      const logoDevImg = await pdfDoc.embedPng(logoDevBytes);

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const PURPLE = rgb(0.57, 0, 1);
      const GRAY = rgb(0.4, 0.4, 0.4);

      // --- PÁGINA 1: CAPA ---
      const p1 = pdfDoc.addPage([841.89, 595.28]);
      p1.drawImage(logoDevImg, { x: 50, y: 480, width: 200, height: 40 }); // Logo Desenvolve no lugar do texto
      p1.drawText('SIMULAÇÃO DE VALORES E COTAÇÃO', { x: 50, y: 400, size: 36, font: fontBold });
      p1.drawText('INICIAL', { x: 50, y: 355, size: 36, font: fontBold });
      p1.drawText('PROJETO DESENVOLVE – PRODEMGE', { x: 50, y: 280, size: 20, font: fontBold });
      p1.drawText(`UNIDADE: ${cityName.toUpperCase()}`, { x: 50, y: 240, size: 16, font: fontBold, color: PURPLE });
      p1.drawText('Programa de Desenvolvimento Econômico e Transformação Social', { x: 50, y: 215, size: 12, font: fontReg, color: GRAY });

      // --- PÁGINA 2: INSTITUCIONAL (COPIADA) ---
      const [page2] = await pdfDoc.copyPages(externalDoc, [1]);
      pdfDoc.addPage(page2);

      // --- PÁGINA 3: DIMENSIONAMENTO ---
const p3 = pdfDoc.addPage([841.89, 595.28]);
const { height: p3Height } = p3.getSize();      
p3.drawImage(logoTopoImg, { 
  x: 50, 
  y: p3Height - 60, // Usa a altura real da página menos 60 (topo)
  width: 35, 
  height: 35 
});      p3.drawText('Dimensionamento', { x: 50, y: 480, size: 32, font: fontBold });
      p3.drawText(`A implementação em ${cityName} está desenhada para um impacto de larga escala.`, { x: 50, y: 430, size: 13, font: fontReg, maxWidth: 700 });
      p3.drawText('Público Beneficiário', { x: 50, y: 360, size: 18, font: fontBold });
      p3.drawText(`Total de Cidadãos: ${calculatedStudents.toLocaleString('pt-BR')}`, { x: 50, y: 330, size: 22, font: fontBold, color: PURPLE });
      p3.drawText('Responsabilidade Municipal', { x: 50, y: 260, size: 18, font: fontBold });
      const respText = `Fornecimento de espaço físico adequado para credenciamento e funcionamento da "Unidade Polo" da Escola Desenvolve, servindo como centro de referência e apoio aos alunos.`;
      p3.drawText(respText, { x: 50, y: 235, size: 13, font: fontReg, maxWidth: 650, lineHeight: 18 });

      // --- PÁGINA 4: INSTITUCIONAL (COPIADA) ---
      const [page4] = await pdfDoc.copyPages(externalDoc, [3]);
      pdfDoc.addPage(page4);

      // --- PÁGINA 5: ENGENHARIA FINANCEIRA ---
      const p5 = pdfDoc.addPage([841.89, 595.28]);
      p5.drawImage(logoTopoImg, { x: 50, y: 530, width: 80, height: 35 }); // Logo Topo Esquerdo
      const unitCost = totalCost / calculatedStudents;
      const globalValue = totalCost >= 1000000 ? `${(totalCost/1000000).toFixed(2)}M` : formatNumber(totalCost);

      p5.drawText('Estrutura de Investimento Social', { x: 50, y: 480, size: 32, font: fontBold });
      
      const drawCol = (val: string, label: string, sub: string, x: number) => {
        p5.drawText(val, { x, y: 350, size: 40, font: fontBold, color: PURPLE });
        p5.drawText(label, { x, y: 310, size: 16, font: fontBold });
        p5.drawText(sub, { x, y: 290, size: 11, font: fontReg, color: GRAY });
      };

      drawCol(`R$ ${formatNumber(unitCost)}`, 'Investimento Unitário', 'Por cidadão beneficiado', 50);
      drawCol(`${calculatedStudents.toLocaleString('pt-BR')}`, 'Total de Cidadãos', 'Cidadãos Beneficiados', 340);
      drawCol(`R$ ${globalValue}`, 'Investimento Global', 'Valor total do projeto', 600);

      // --- PÁGINAS FINAIS (COPIADAS) ---
      const finalIndices = [5, 6, 9];
      const copiedFinals = await pdfDoc.copyPages(externalDoc, finalIndices);
      copiedFinals.forEach(p => pdfDoc.addPage(p));

      // --- FINALIZAÇÃO ---
      const pdfSave = await pdfDoc.save();
      const base64String = btoa(new Uint8Array(pdfSave).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      const pdfBase64 = `data:application/pdf;base64,${base64String}`;

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ pdfBase64, recipients: emails.filter(e => e.is_selected).map(e => e.email) }),
      });

      if (res.ok) toast.success("PDF com logos enviado!");
      else throw new Error();

    } catch (err) {
      console.error(err);
      toast.error("Erro crítico: Verifique se logo-topo.png e logo-desenvolve.png estão na pasta public.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2, borderTop: '5px solid #9100ff' }}>
      <ToastContainer position="top-right" />
      <Dialog open={openCityPopup} onClose={() => !loading && setOpenCityPopup(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: 'Conthrax', color: '#9100ff' }}>Enviar Proposta</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Cidade da Unidade" value={cityName} onChange={(e) => setCityName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCityPopup(false)}>Cancelar</Button>
          <Button onClick={generateAndSendPDF} variant="contained" sx={{ bgcolor: '#9100ff' }}>Enviar</Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Conthrax' }}>Disparo Institucional</Typography>
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
          <ListItem key={e.id}>
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
      <Button fullWidth variant="contained" onClick={triggerCityPopup} startIcon={<SendIcon />} sx={{ bgcolor: '#9100ff', py: 2 }}>
        {loading ? "PROCESSANDO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};