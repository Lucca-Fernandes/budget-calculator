import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
  Button,
} from '@mui/material';

import logo from '../assets/logo.png';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
// CORREÇÃO: Atualização da cor para o novo tom solicitado
const PRIMARY_PURPLE = '#9100ff'; 

const getFormattedCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface YearlyPayment { 
    year: number; 
    months: number; 
    total: number;
}

const Calculator: React.FC = () => {
  // Inicia como string vazia para exibir o placeholder
  const [studentsInput, setStudentsInput] = useState<string>('');
  
  // O número confirmado para o cálculo (Inicia zerado)
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);

  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate()); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentsInput(e.target.value);
  };

  const handleCalculate = () => {
    // 1. Remove tudo que não for número
    const cleanString = studentsInput.replace(/\D/g, '');
    
    // 2. Converte para número (se vazio, vira 0)
    const numberValue = parseInt(cleanString, 10) || 0;

    // 3. Atualiza o estado do cálculo
    setCalculatedStudents(numberValue);
  };

  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  };

  // --- CÁLCULOS ---
  const baseCostPerStudent = 31500;
  const totalCost = calculatedStudents * baseCostPerStudent;

  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const totalFees = entryFee + deliveryFee;

  const totalMonthlyParcels = 24;
  const remainingCost = totalCost - totalFees;
  const monthlyPayment = remainingCost / totalMonthlyParcels;

  // Lógica de Datas
  const selectedDate = new Date(currentDate);
  const yearlyPayments: YearlyPayment[] = [];

  const getYearEntry = (year: number): YearlyPayment => {
    let entry = yearlyPayments.find(p => p.year === year);
    if (!entry) {
      entry = { year, months: 0, total: 0 };
      yearlyPayments.push(entry);
      yearlyPayments.sort((a, b) => a.year - b.year); 
    }
    return entry;
  };

  if (calculatedStudents > 0) {
      const entryFeePaymentDate = new Date(selectedDate);
      entryFeePaymentDate.setDate(selectedDate.getDate() + 30);
      const entryYear = entryFeePaymentDate.getFullYear();
      const entryEntry = getYearEntry(entryYear);
      entryEntry.total += entryFee;
      entryEntry.months += 1;

      const deliveryFeePaymentDate = new Date(selectedDate);
      deliveryFeePaymentDate.setDate(selectedDate.getDate() + 60);
      const deliveryYear = deliveryFeePaymentDate.getFullYear();
      const deliveryEntry = getYearEntry(deliveryYear);
      deliveryEntry.total += deliveryFee;
      deliveryEntry.months += 1;

      const firstInstallmentDate = new Date(selectedDate);
      firstInstallmentDate.setDate(selectedDate.getDate() + 90);
      let currentInstallmentYear = firstInstallmentDate.getFullYear();
      let currentInstallmentMonth = firstInstallmentDate.getMonth();

      for (let i = 0; i < totalMonthlyParcels; i++) {
        const entry = getYearEntry(currentInstallmentYear);
        entry.total += monthlyPayment;
        entry.months += 1;
        currentInstallmentMonth++;
        if (currentInstallmentMonth > 11) {
          currentInstallmentMonth = 0;
          currentInstallmentYear++;
        }
      }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: '100vh' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 6,
          '& img': { 
            width: '450px', 
            height: '100px',
            ['@media (max-width:600px)']: { 
              width: '250px', 
              height: 'auto', 
            },
          }
        }}
      >
        <img src={logo} alt="Logo Calculadora" />
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

        {/* Grupo Input + Botão */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
            <TextField
            label="Quantidade de Alunos"
            type="text"
            placeholder="Digite a quantidade"
            value={studentsInput}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily: FONT_FAMILY, } }}
            inputProps={{
                inputMode: 'numeric',
                sx: { fontSize: '1.5rem', fontFamily: FONT_FAMILY, m: 0.5 }
            }}
            fullWidth
            variant="outlined"
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleCalculate();
            }}
            />
            
            <Button 
                variant="contained" 
                size="large"
                onClick={handleCalculate}
                sx={{ 
                    fontFamily: FONT_FAMILY,
                    fontSize: '1.2rem',
                    px: 4,
                    fontWeight: 'bold',
                    backgroundColor: PRIMARY_PURPLE,
                    '&:hover': {
                        backgroundColor: '#7200c9', // Tom mais escuro para o hover
                    }
                }}
            >
                Calcular
            </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 5 }}>
          <Typography
            variant="h3"
            sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}
          >
            Orçamento
          </Typography>

          {calculatedStudents > 0 ? (
            <>
                <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY, }}>
                    10% - 30 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(entryFee)}</span>
                </Typography>

                <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily: FONT_FAMILY, ml: 0.3 }}>
                    10% - 60 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(deliveryFee)}</span>
                </Typography>

                {yearlyPayments.length > 0 ? (
                    <>
                    {/* Texto com a nova cor */}
                    <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', fontSize: '1.8rem', fontFamily: FONT_FAMILY, color: PRIMARY_PURPLE, mb: 2 }} 
                        >
                            {totalMonthlyParcels}x <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(monthlyPayment)}</span>
                    </Typography>

                    <Box sx={{
                    mb: 3,
                    border: `5px solid ${PRIMARY_PURPLE}`, // Borda com a nova cor
                    px: 3, 
                    py: 2, 
                    bgcolor: 'background.default',
                    borderRadius: '8px',
                    }}>                
                    {/* Texto Preto dentro da Box */}
                    <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', fontSize: '1.6rem', fontFamily: FONT_FAMILY, color: 'black', mb: 2 }} 
                        >
                            Distribuição de orçamento
                        </Typography>
                    
                    {yearlyPayments.map((payment) => (
                        <Typography key={payment.year} variant="body1" sx={{ fontSize: '1.1rem', fontFamily: FONT_FAMILY, mt: 0.5 }}>
                        Total em {payment.year} ({payment.months} meses): <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(payment.total)}</span>
                        </Typography>
                    ))}
                    </Box>
                    </>
                ) : null}

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY }}>
                    Investimento total: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(totalCost)}</span>
                </Typography>
            </>
          ) : (
             // Estado vazio
             <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                <Typography variant="h5" sx={{ fontFamily: FONT_FAMILY }}>
                    Digite a quantidade de alunos e clique em Calcular.
                </Typography>
             </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Calculator;