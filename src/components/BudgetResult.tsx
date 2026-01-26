import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';

interface YearlyPayment { 
    year: number; 
    months: number; 
    total: number;
}

interface BudgetResultProps {
  calculatedStudents: number;
  entryFee: number;
  deliveryFee: number;
  monthlyPayment: number;
  totalMonthlyParcels: number;
  totalCost: number;
  yearlyPayments: YearlyPayment[];
  primaryColor: string;
  fontFamily: string;
  formatNumber: (v: number) => string;
}

export const BudgetResult: React.FC<BudgetResultProps> = (props) => {
  const { calculatedStudents, entryFee, deliveryFee, monthlyPayment, totalMonthlyParcels, totalCost, yearlyPayments, primaryColor, fontFamily, formatNumber } = props;

  if (calculatedStudents <= 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 5, mt: 4 }}>
      <Typography variant="h3" sx={{ mb: 5, fontSize: '2.5rem', fontFamily, fontWeight: 700 }}>
        Orçamento
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily }}>
        10% - 30 dias: R$ {formatNumber(entryFee)}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily, ml: 0.3 }}>
        10% - 60 dias: R$ {formatNumber(deliveryFee)}
      </Typography>
      
      <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.8rem', fontFamily, color: primaryColor, mb: 2 }}>
        {totalMonthlyParcels}x R$ {formatNumber(monthlyPayment)}
      </Typography>

      <Box sx={{ mb: 3, border: `5px solid ${primaryColor}`, px: 3, py: 2, borderRadius: '8px' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.6rem', fontFamily, color: 'black', mb: 2 }}>
          Distribuição de orçamento
        </Typography>
        {yearlyPayments.map((payment) => (
          <Typography key={payment.year} variant="body1" sx={{ fontSize: '1.1rem', fontFamily, mt: 0.5 }}>
            Total em {payment.year} ({payment.months} meses): R$ {formatNumber(payment.total)}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily }}>
        Investimento total: R$ {formatNumber(totalCost)}
      </Typography>
    </Paper>
  );
};