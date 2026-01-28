import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { BudgetForm } from './BudgetForm';
import { BudgetResult } from './BudgetResult';
import { EmailManager } from './EmailManager';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
const PRIMARY_PURPLE = '#9100ff';

interface BudgetCalculatorProps {
  showEmailTrigger?: boolean;
}

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ showEmailTrigger = false }) => {
  const [studentsInput, setStudentsInput] = useState<string>('');
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleCalculate = () => {
    const cleanString = studentsInput.replace(/\D/g, '');
    setCalculatedStudents(parseInt(cleanString, 10) || 0);
  };

  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
  };

  const totalCost = calculatedStudents * 31500;
  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const totalMonthlyParcels = 24;
  const monthlyPayment = (totalCost - (entryFee + deliveryFee)) / totalMonthlyParcels;

  const yearlyPayments: any[] = [];
  const selectedDate = new Date(currentDate);

  if (calculatedStudents > 0 && !isNaN(selectedDate.getTime())) {
    const getYearEntry = (year: number) => {
      let entry = yearlyPayments.find(p => p.year === year);
      if (!entry) {
        entry = { year, months: 0, total: 0 };
        yearlyPayments.push(entry);
      }
      return entry;
    };

    [30, 60].forEach((days, i) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + days);
      const entry = getYearEntry(d.getFullYear());
      entry.total += i === 0 ? entryFee : deliveryFee;
      entry.months += 1;
    });

    for (let i = 0; i < totalMonthlyParcels; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 90);
      d.setMonth(d.getMonth() + i);
      const entry = getYearEntry(d.getFullYear());
      entry.total += monthlyPayment;
      entry.months += 1;
    }
    yearlyPayments.sort((a, b) => a.year - b.year);
  }

  return (
    <Box>
      <BudgetForm 
        currentDate={currentDate} setCurrentDate={setCurrentDate}
        studentsInput={studentsInput} handleInputChange={(e) => setStudentsInput(e.target.value)}
        handleCalculate={handleCalculate} fontFamily={FONT_FAMILY} primaryColor={PRIMARY_PURPLE}
      />
      <div id="capture-area" style={{ background: '#fff' }}>
        <Paper elevation={3} sx={{ p: 5 }}>
          <Typography variant="h3" sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}>
            Orçamento
          </Typography>
          <BudgetResult 
            calculatedStudents={calculatedStudents} entryFee={entryFee}
            deliveryFee={deliveryFee} monthlyPayment={monthlyPayment}
            totalMonthlyParcels={totalMonthlyParcels} yearlyPayments={yearlyPayments}
            totalCost={totalCost} formatNumber={formatNumber}
            fontFamily={FONT_FAMILY} primaryColor={PRIMARY_PURPLE}
          />
        </Paper>
      </div>
      {calculatedStudents > 0 && showEmailTrigger && <EmailManager />}
    </Box>
  );
};

export default BudgetCalculator;