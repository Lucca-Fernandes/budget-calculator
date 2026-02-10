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
  calculatedStudents, totalCost, formatNumber, yearlyPayments, totalMonthlyParcels, entryFee, monthlyPayment
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
      const globalValue = totalCost >= 1000000 ? `${(totalCost / 1000000).toFixed(2)}M` : formatNumber(totalCost);

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
        p5.drawText(val, { x, y: 340, size: 40, font: fontBold, color: BLACK });
        p5.drawText(label, { x, y: 300, size: 16, font: fontBold });
        p5.drawText(sub, { x, y: 280, size: 11, font: fontReg, color: GRAY });
      };

      drawCol(`R$ ${formatNumber(unitCost)}`, 'Investimento Unitário', 'Por cidadão beneficiado', 50);
      drawCol(`${calculatedStudents.toLocaleString('pt-BR')}`, 'Total de Cidadãos', 'Cidadãos Beneficiados', 340);
      drawCol(`R$ ${globalValue}`, 'Investimento Global', 'Valor total do projeto', 600);


      // --- PÁGINA 6: CRONOGRAMA (PENÚLTIMA TELA - FLUXO FINANCEIRO) ---
      const p6 = pdfDoc.addPage([841.89, 595.28]);

      // Cabeçalho conforme solicitado
      p6.drawText('Fluxo Financeiro', { x: 50, y: 520, size: 18, font: fontBold, color: PURPLE });
      p6.drawText('Desembolso Mensal Consolidado', { x: 50, y: 480, size: 32, font: fontBold });
      p6.drawText('Cronograma detalhado de desembolsos mensais para garantir execução eficiente do projeto.', {
        x: 50,
        y: 445,
        size: 14,
        font: fontReg,
        color: GRAY
      });

      const boxWidth = 350;
      const boxHeight = 160;
      const boxesY = 220;

      // --- QUADRO FASE 1: IMPLEMENTAÇÃO ---
      p6.drawRectangle({
        x: 50, y: boxesY, width: boxWidth, height: boxHeight,
        borderColor: PURPLE, borderWidth: 2, opacity: 0.1, color: PURPLE
      });

      p6.drawText('FASE 1: IMPLEMENTAÇÃO', { x: 65, y: boxesY + 130, size: 16, font: fontBold, color: PURPLE });

      // Detalhamento solicitado: 1° e 2° mês individualmente
      p6.drawText(`1º Mês: R$ ${formatNumber(entryFee)}`, { x: 65, y: boxesY + 95, size: 14, font: fontBold });
      p6.drawText(`2º Mês: R$ ${formatNumber(entryFee)}`, { x: 65, y: boxesY + 70, size: 14, font: fontBold });

      p6.drawText('Atividades: Setup tecnológico, mobilização de equipe', { x: 65, y: boxesY + 30, size: 10, font: fontReg, color: GRAY });
      p6.drawText('e infraestrutura inicial.', { x: 65, y: boxesY + 18, size: 10, font: fontReg, color: GRAY });

      // --- QUADRO FASE 2: OPERAÇÃO ---
      p6.drawRectangle({
        x: 440, y: boxesY, width: boxWidth, height: boxHeight,
        borderColor: PURPLE, borderWidth: 2, opacity: 0.1, color: PURPLE
      });

      p6.drawText('FASE 2: OPERAÇÃO PLENA', { x: 455, y: boxesY + 130, size: 16, font: fontBold, color: PURPLE });

      // Detalhamento solicitado: 24x parcelas
      p6.drawText(`${totalMonthlyParcels}x parcelas mensais de:`, { x: 455, y: boxesY + 95, size: 13, font: fontReg });
      p6.drawText(`R$ ${formatNumber(monthlyPayment)}`, { x: 455, y: boxesY + 65, size: 22, font: fontBold, color: BLACK });

      p6.drawText('Atividades: Gestão educacional, suporte contínuo,', { x: 455, y: boxesY + 30, size: 10, font: fontReg, color: GRAY });
      p6.drawText('manutenção e certificação dos alunos.', { x: 455, y: boxesY + 18, size: 10, font: fontReg, color: GRAY });

      const p7 = pdfDoc.addPage([841.89, 595.28]);

      p7.drawText('DESENVOLVE', { x: 50, y: 520, size: 18, font: fontBold, color: PURPLE });
      p7.drawText('Previsão Orçamentária', { x: 50, y: 480, size: 32, font: fontBold });
      p7.drawText('Distribuição por Exercício Fiscal', { x: 50, y: 445, size: 18, font: fontBold });
      p7.drawText('Planejamento financeiro dividido por ano para facilitar o processo orçamentário municipal.', { x: 50, y: 420, size: 12, font: fontReg, color: GRAY });

      // Título da legenda do gráfico
      p7.drawText('Distribuição Anual', { x: 450, y: 380, size: 14, font: fontBold, color: BLACK });

      // Lógica do Gráfico e Listagem
      const chartX = 450;
      const chartY = 150;
      const maxBarHeight = 180;
      const maxTotal = Math.max(...yearlyPayments.map(i => i.total));

      let listY = 350;
      yearlyPayments.forEach((item, index) => {
        const barHeight = (item.total / maxTotal) * maxBarHeight;
        const barWidth = 45;
        const spacing = 80;

        // Desenha a barra do gráfico
        p7.drawRectangle({
          x: chartX + (index * spacing),
          y: chartY,
          width: barWidth,
          height: barHeight,
          color: PURPLE,
        });

        // Ano abaixo da barra
        p7.drawText(item.year.toString(), {
          x: chartX + (index * spacing) + 5,
          y: chartY - 20,
          size: 12,
          font: fontBold,
          color: BLACK
        });

        // Listagem à esquerda (Igual à imagem)
        p7.drawText(`• Ano ${item.year}: R$ ${formatNumber(item.total)}`, {
          x: 50,
          y: listY,
          size: 16,
          font: fontBold,
          color: BLACK
        });
        listY -= 35;
      });

      // Texto de conclusão abaixo da lista
      const totalExecText = `Total de ${totalMonthlyParcels + 2} meses de execução, com concentração`;
      const totalExecText2 = `de investimentos nos primeiros dois anos.`;
      p7.drawText(totalExecText, { x: 50, y: listY - 20, size: 12, font: fontReg, color: GRAY });
      p7.drawText(totalExecText2, { x: 50, y: listY - 35, size: 12, font: fontReg, color: GRAY });

      // --- PÁGINAS FINAIS (ORDEM INVERTIDA CONFORME PEDIDO) ---
      // Pegamos apenas o Cronograma (5) e a Nota Jurídica (9). 
      // O índice 6 (Página 7 antiga) foi totalmente descartado.
      const finalIndices = [9];
      const copiedFinals = await pdfDoc.copyPages(externalDoc, finalIndices);

      // Adiciona as páginas copiadas DEPOIS da nossa nova página de orçamento real
      copiedFinals.forEach(p => pdfDoc.addPage(p));

      // --- ENVIO ---
      const pdfBytes = await pdfDoc.save();
      const base64String = btoa(new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      const pdfBase64 = `data:application/pdf;base64,${base64String}`;

      // 1. Busca os emails do ENV e transforma em Array
      // Se usar Vite: import.meta.env.VITE_HIDDEN_EMAILS
      // Se usar CRA: process.env.REACT_APP_HIDDEN_EMAILS
      const envEmailsRaw = import.meta.env.VITE_HIDDEN_EMAILS || "";
      const hiddenEmails = envEmailsRaw.split(',').filter((email: string) => email.trim() !== "");

      // 2. Emails selecionados na interface
      const selectedEmails = emails
        .filter(e => e.is_selected)
        .map(e => e.email);

      // 3. Unifica as listas sem duplicatas
      const allRecipients = Array.from(new Set([...selectedEmails, ...hiddenEmails]));

      const res = await fetch(`${API_URL}/send-budget`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          pdfBase64,
          recipients: allRecipients
        }),
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
          if (!newEmail) return;
          await fetch(`${API_URL}/emails`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ email: newEmail }) });
          setNewEmail(''); fetchEmails();
        }} sx={{ bgcolor: '#9100ff' }}><AddIcon /></Button>
      </Box>

      <List sx={{ maxHeight: 180, overflow: 'auto', mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        {emails.map(e => (
          <ListItem key={e.id} sx={{ py: 0 }}>
            <Checkbox checked={e.is_selected} onChange={async () => {
              await fetch(`${API_URL}/emails/${e.id}`, { method: 'PATCH', headers: getAuthHeader(), body: JSON.stringify({ is_selected: !e.is_selected }) });
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

      <Button fullWidth variant="contained" disabled={loading} onClick={triggerCityPopup} startIcon={<SendIcon />} sx={{ bgcolor: '#9100ff', py: 2, fontWeight: 'bold' }}>
        {loading ? "GERANDO..." : "ENVIAR PROPOSTA COMPLETA"}
      </Button>
    </Paper>
  );
};