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

interface YearlyPayment { 
    year: number; 
    months: number; 
    total: number;
}

const BudgetCalculator: React.FC = () => {
  const [studentsInput, setStudentsInput] = useState<string>('');
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentsInput(e.target.value);
  };

  const handleCalculate = () => {
    const cleanString = studentsInput.replace(/\D/g, '');
    const numberValue = parseInt(cleanString, 10) || 0;
    setCalculatedStudents(numberValue);
  };

  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  };

  const baseCostPerStudent = 31500;
  const totalCost = calculatedStudents * baseCostPerStudent;
  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const totalMonthlyParcels = 24;
  const remainingCost = totalCost - (entryFee + deliveryFee);
  const monthlyPayment = remainingCost / totalMonthlyParcels;

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
      const entryFeePaymentDate = new Date(selectedDate);
      entryFeePaymentDate.setDate(selectedDate.getDate() + 30);
      const entryEntry = getYearEntry(entryFeePaymentDate.getFullYear());
      entryEntry.total += entryFee;
      entryEntry.months += 1;

      const deliveryFeePaymentDate = new Date(selectedDate);
      deliveryFeePaymentDate.setDate(selectedDate.getDate() + 60);
      const deliveryEntry = getYearEntry(deliveryFeePaymentDate.getFullYear());
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
    <Box>
      <BudgetForm 
        currentDate={currentDate} 
        setCurrentDate={setCurrentDate}
        studentsInput={studentsInput}
        handleInputChange={handleInputChange}
        handleCalculate={handleCalculate}
        fontFamily={FONT_FAMILY}
        primaryColor={PRIMARY_PURPLE}
      />
      
      <Paper elevation={3} sx={{ p: 5 }}>
        <Typography variant="h3" sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}>
          Orçamento
        </Typography>

        <BudgetResult 
          calculatedStudents={calculatedStudents}
          entryFee={entryFee}
          deliveryFee={deliveryFee}
          monthlyPayment={monthlyPayment}
          totalMonthlyParcels={totalMonthlyParcels}
          yearlyPayments={yearlyPayments}
          totalCost={totalCost}
          formatNumber={formatNumber}
          fontFamily={FONT_FAMILY}
          primaryColor={PRIMARY_PURPLE}
        />
      </Paper>
    </Box>
  );
};

export default BudgetCalculator;