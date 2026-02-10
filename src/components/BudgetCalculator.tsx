import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { BudgetForm } from './BudgetForm';
import { BudgetResult } from './BudgetResult';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
const PRIMARY_PURPLE = '#9100ff';

const getFormattedCurrentDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

interface YearlyPayment { year: number; months: number; total: number; }

const BudgetCalculator: React.FC = () => {
  const [studentsInput, setStudentsInput] = useState<string>('');
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setStudentsInput(e.target.value);
  
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

  const selectedDate = new Date(currentDate);
  const isDateValid = !isNaN(selectedDate.getTime()); 
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

  if (calculatedStudents > 0 && isDateValid) {
      const d30 = new Date(selectedDate);
      d30.setDate(selectedDate.getDate() + 30);
      const e30 = getYearEntry(d30.getFullYear());
      e30.total += entryFee; e30.months += 1;

      const d60 = new Date(selectedDate);
      d60.setDate(selectedDate.getDate() + 60);
      const e60 = getYearEntry(d60.getFullYear());
      e60.total += deliveryFee; e60.months += 1;

      const fDate = new Date(selectedDate);
      fDate.setDate(selectedDate.getDate() + 90);
      let cYear = fDate.getFullYear();
      let cMonth = fDate.getMonth();

      for (let i = 0; i < totalMonthlyParcels; i++) {
        const entry = getYearEntry(cYear);
        entry.total += monthlyPayment;
        entry.months += 1;
        cMonth++;
        if (cMonth > 11) { cMonth = 0; cYear++; }
      }
  }

  return (
    <Box>
      <BudgetForm 
        currentDate={currentDate} setCurrentDate={setCurrentDate}
        studentsInput={studentsInput} handleInputChange={handleInputChange}
        handleCalculate={handleCalculate} fontFamily={FONT_FAMILY} primaryColor={PRIMARY_PURPLE}
      />
     <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, mt: { xs: 2, md: 4 } }}>
    <Typography variant="h3" sx={{ mb: { xs: 3, md: 5 }, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}>
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
    </Box>
  );
};

export default BudgetCalculator;