import React, { useState } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { BudgetForm } from './BudgetForm';
import { BudgetResult } from './BudgetResult';
import { EmailManager } from './EmailManager';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
const PRIMARY_PURPLE = '#9100ff';

const BudgetCalculator: React.FC = () => {
  const [studentsInput, setStudentsInput] = useState<string>('');
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
  };

  const handleCalculate = () => {
    setCalculatedStudents(parseInt(studentsInput.replace(/\D/g, ''), 10) || 0);
  };

  const totalCost = calculatedStudents * 31500;
  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const monthlyPayment = (totalCost - (entryFee + deliveryFee)) / 24;

  // Lógica de datas (Simplificada para o exemplo)
  const yearlyPayments: any[] = []; 
  if (calculatedStudents > 0) {
    yearlyPayments.push({ year: 2026, months: 11, total: 315000 }); // Exemplo baseado na sua imagem
  }

  return (
    <Box>
      <BudgetForm 
        currentDate={currentDate} setCurrentDate={setCurrentDate}
        studentsInput={studentsInput} handleInputChange={(e) => setStudentsInput(e.target.value)}
        handleCalculate={handleCalculate} fontFamily={FONT_FAMILY} primaryColor={PRIMARY_PURPLE}
      />
      <Paper elevation={3} sx={{ p: 5 }}>
        <Typography variant="h3" sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}>
          Orçamento
        </Typography>
        <BudgetResult 
          calculatedStudents={calculatedStudents} entryFee={entryFee}
          deliveryFee={deliveryFee} monthlyPayment={monthlyPayment}
          totalMonthlyParcels={24} yearlyPayments={yearlyPayments}
          totalCost={totalCost} formatNumber={formatNumber}
          fontFamily={FONT_FAMILY} primaryColor={PRIMARY_PURPLE}
        />
        {calculatedStudents > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <EmailManager />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BudgetCalculator;