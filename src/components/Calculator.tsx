import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
} from '@mui/material';

import logo from '../assets/logo.png';


const FONT_FAMILY = 'Conthrax, Arial, sans-serif';

const getFormattedCurrentDate = (): string => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Tipagem para os detalhes de pagamento anuais
interface YearlyPayment { 
    year: number; 
    months: number; 
    total: number;
}

const Calculator: React.FC = () => {
  const [students, setStudents] = useState<number>(150);
  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate()); 

  const handleStudentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números inteiros
    if (/^\d*$/.test(value)) {
      setStudents(Number(value));
    }
  };


  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    // Substitui ponto por vírgula para números maiores que 999
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  };

  const baseCostPerStudent = 31500;
  const totalCost = students * baseCostPerStudent;

  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const totalFees = entryFee + deliveryFee;

  const totalMonthlyParcels = 24;
  const remainingCost = totalCost - totalFees;
  const monthlyPayment = remainingCost / totalMonthlyParcels;

  // --- INÍCIO DA LÓGICA DE CÁLCULO CORRIGIDA ---
  const selectedDate = new Date(currentDate);
  
  const yearlyPayments: YearlyPayment[] = [];

  // 1. Função auxiliar para encontrar ou criar a entrada de um ano
  const getYearEntry = (year: number): YearlyPayment => {
    let entry = yearlyPayments.find(p => p.year === year);
    if (!entry) {
      entry = { year, months: 0, total: 0 };
      yearlyPayments.push(entry);
      // Garante que a exibição dos anos esteja sempre na ordem correta
      yearlyPayments.sort((a, b) => a.year - b.year); 
    }
    return entry;
  };

  // 2. Pagamento da Entrada (30 dias após assinatura)
  const entryFeePaymentDate = new Date(selectedDate);
  entryFeePaymentDate.setDate(selectedDate.getDate() + 30);
  
  const entryYear = entryFeePaymentDate.getFullYear();
  const entryEntry = getYearEntry(entryYear);
  entryEntry.total += entryFee;
  entryEntry.months += 1; // Contabiliza como 1 bloco de pagamento

  // 3. Pagamento da Entrega (60 dias após assinatura)
  const deliveryFeePaymentDate = new Date(selectedDate);
  deliveryFeePaymentDate.setDate(selectedDate.getDate() + 60);

  const deliveryYear = deliveryFeePaymentDate.getFullYear();
  const deliveryEntry = getYearEntry(deliveryYear);
  deliveryEntry.total += deliveryFee;
  deliveryEntry.months += 1; // Contabiliza como 1 bloco de pagamento

  // 4. Início da 1ª das 24 parcelas (após 90 dias)
  const firstInstallmentDate = new Date(selectedDate);
  firstInstallmentDate.setDate(selectedDate.getDate() + 90);
  
  let currentInstallmentYear = firstInstallmentDate.getFullYear();
  let currentInstallmentMonth = firstInstallmentDate.getMonth(); // 0 (Jan) a 11 (Dez)

  // 5. Loop para as 24 parcelas mensais
  for (let i = 0; i < totalMonthlyParcels; i++) {
    
    const entry = getYearEntry(currentInstallmentYear);
    entry.total += monthlyPayment;
    entry.months += 1; // Contabiliza como 1 bloco de pagamento

    // Avança para o próximo mês/ano
    currentInstallmentMonth++;
    if (currentInstallmentMonth > 11) {
      currentInstallmentMonth = 0; // Janeiro
      currentInstallmentYear++; // Próximo ano
    }
  }
  // --- FIM DA LÓGICA DE CÁLCULO CORRIGIDA ---

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: '100vh' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 6,
          '& img': { // Aplica estilos à tag img dentro deste Box
            width: '450px', 
            height: '100px',
            
            // ALTERNATIVA: Reduz o tamanho da logo para mobile (max-width: 600px)
            ['@media (max-width:600px)']: { 
              width: '250px', 
              height: 'auto', 
            },
          }
        }}
      >
        <img
          src={logo}
          alt="Logo Calculadora"
        />
      </Box>

      <Typography
        variant="h1"
        align="center"
        color="black"
        sx={{ fontSize: '2.7rem', fontFamily: FONT_FAMILY }}
      >
        Calculadora de Orçamento
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 6, mb: 6, }}>
        <TextField
          label="Data da Assinatura"
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily: FONT_FAMILY, } }}
          inputProps={{ sx: { fontSize: '1.4rem', fontFamily: FONT_FAMILY, m: 0.5 } }}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Quantidade de Alunos"
          type="text"
          placeholder="Digite um número"
          value={students}
          onChange={handleStudentsChange}
          InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily: FONT_FAMILY, } }}
          inputProps={{
            inputMode: 'numeric',
            sx: { fontSize: '1.5rem', fontFamily: FONT_FAMILY, m: 0.5 }
          }}
          fullWidth
          variant="outlined"
        />
      </Box>

      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 5 }}>

          <Typography
            variant="h3"
            sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}
          >
            Orçamento
          </Typography>


          <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY, }}>
            10% - 30 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(entryFee)}</span>
          </Typography>

          <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily: FONT_FAMILY, ml: 0.3 }}>
            10% - 60 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(deliveryFee)}</span>
          </Typography>

          {yearlyPayments.length > 0 ? (
            <Box sx={{
              mb: 3,
              border: '5px solid #1976d2', 
              px: 3, 
              py: 2, 
              bgcolor: 'background.default',
              borderRadius: '8px',
            }}>                
            <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', fontSize: '1.8rem', fontFamily: FONT_FAMILY, color: 'primary.main' }} 
                >
                    {totalMonthlyParcels}x <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(monthlyPayment)}</span>
                </Typography>
              {/* Detalhamento das Parcelas Anuais */}
              {yearlyPayments.map((payment) => (
                <Typography key={payment.year} variant="body1" sx={{ fontSize: '1.1rem', fontFamily: FONT_FAMILY, mt: 0.5 }}>
                  Total em {payment.year} ({payment.months} meses): <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(payment.total)}</span>
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily: FONT_FAMILY }}>
              Nenhuma parcela disponível.
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY }}>
            Investimento total: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(totalCost)}</span>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Calculator;