import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface YearlyPayment { year: number; months: number; total: number; }

interface Props {
  calculatedStudents: number;
  entryFee: number;
  deliveryFee: number;
  monthlyPayment: number;
  totalMonthlyParcels: number;
  yearlyPayments: YearlyPayment[];
  totalCost: number;
  formatNumber: (v: number) => string;
  fontFamily: string;
  primaryColor: string;
}


export const BudgetResult: React.FC<Props> = ({
  calculatedStudents, entryFee, deliveryFee, monthlyPayment, totalMonthlyParcels, yearlyPayments, totalCost, formatNumber, fontFamily, primaryColor
}) => {
  if (calculatedStudents <= 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
        <Typography variant="h5" sx={{ fontFamily }}>
          Digite a quantidade de alunos e clique em Calcular.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily }}>
        10% - 30 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(entryFee)}</span>
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily, ml: 0.3 }}>
        10% - 60 dias após assinatura do contrato: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(deliveryFee)}</span>
      </Typography>

      {yearlyPayments.length > 0 && (
        <>
          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.8rem', fontFamily, color: primaryColor, mb: 2 }}>
            {totalMonthlyParcels}x <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(monthlyPayment)}</span>
          </Typography>
          <Box sx={{ mb: 3, border: `5px solid ${primaryColor}`, px: 3, py: 2, borderRadius: '8px', bgcolor: 'background.default' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.6rem', fontFamily, color: 'black', mb: 2 }}>
              Distribuição de orçamento
            </Typography>
            {yearlyPayments.map((payment) => (
              <Typography key={payment.year} variant="body1" sx={{ fontSize: '1.1rem', fontFamily, mt: 0.5 }}>
                Total em {payment.year} ({payment.months} meses): <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(payment.total)}</span>
              </Typography>
            ))}
          </Box>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily }}>
        Investimento total: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(totalCost)}</span>
      </Typography>
    </>
  );
};