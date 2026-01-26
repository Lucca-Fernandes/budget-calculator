import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, Divider, Button } from '@mui/material';

const FONT_FAMILY = 'Conthrax, Arial, sans-serif';
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

interface Props {
  showEmailTrigger?: boolean; 
}

const BudgetCalculator: React.FC<Props> = ({ showEmailTrigger }) => {
  const [studentsInput, setStudentsInput] = useState<string>('');
  const [calculatedStudents, setCalculatedStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setStudentsInput(e.target.value);

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

  const yearlyPayments: YearlyPayment[] = [];
  if (calculatedStudents > 0) {
      const selectedDate = new Date(currentDate);
      const getYearEntry = (year: number): YearlyPayment => {
        let entry = yearlyPayments.find(p => p.year === year);
        if (!entry) {
          entry = { year, months: 0, total: 0 };
          yearlyPayments.push(entry);
          yearlyPayments.sort((a, b) => a.year - b.year); 
        }
        return entry;
      };

      [30, 60].forEach((days) => {
        const d = new Date(selectedDate);
        d.setDate(selectedDate.getDate() + days);
        const entry = getYearEntry(d.getFullYear());
        entry.total += (totalCost * 0.1);
        entry.months += 1;
      });

      const firstInstallmentDate = new Date(selectedDate);
      firstInstallmentDate.setDate(selectedDate.getDate() + 90);
      let currYear = firstInstallmentDate.getFullYear();
      let currMonth = firstInstallmentDate.getMonth();

      for (let i = 0; i < totalMonthlyParcels; i++) {
        const entry = getYearEntry(currYear);
        entry.total += monthlyPayment;
        entry.months += 1;
        currMonth++;
        if (currMonth > 11) { currMonth = 0; currYear++; }
      }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 6, mb: 6 }}>
        <TextField
          label="Data da Assinatura"
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily: FONT_FAMILY } }}
          inputProps={{ sx: { fontSize: '1.4rem', fontFamily: FONT_FAMILY, m: 0.5 } }}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
          <TextField
            label="Quantidade de Alunos"
            placeholder="Digite a quantidade"
            value={studentsInput}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily: FONT_FAMILY } }}
            inputProps={{ inputMode: 'numeric', sx: { fontSize: '1.5rem', fontFamily: FONT_FAMILY, m: 0.5 } }}
            fullWidth
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          />
          <Button 
            variant="contained" 
            onClick={handleCalculate}
            sx={{ fontFamily: FONT_FAMILY, fontSize: '1.2rem', px: 4, fontWeight: 'bold', backgroundColor: PRIMARY_PURPLE, '&:hover': { backgroundColor: '#7200c9' } }}
          >
            Calcular
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 5 }}>
        <Typography variant="h3" sx={{ mb: 5, fontSize: '2.5rem', fontFamily: FONT_FAMILY, fontWeight: 700 }}>
          Orçamento
        </Typography>

        {calculatedStudents > 0 ? (
          <>
            <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY }}>
                10% - 30 dias: R$ {formatNumber(entryFee)}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily: FONT_FAMILY, ml: 0.3 }}>
                10% - 60 dias: R$ {formatNumber(deliveryFee)}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.8rem', fontFamily: FONT_FAMILY, color: PRIMARY_PURPLE, mb: 2 }}>
                24x R$ {formatNumber(monthlyPayment)}
            </Typography>
            <Box sx={{ mb: 3, border: `5px solid ${PRIMARY_PURPLE}`, px: 3, py: 2, borderRadius: '8px' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.6rem', fontFamily: FONT_FAMILY, color: 'black', mb: 2 }}>
                    Distribuição de orçamento
                </Typography>
                {yearlyPayments.map((p) => (
                    <Typography key={p.year} variant="body1" sx={{ fontSize: '1.1rem', fontFamily: FONT_FAMILY, mt: 0.5 }}>
                        Total em {p.year} ({p.months} meses): R$ {formatNumber(p.total)}
                    </Typography>
                ))}
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 1, fontFamily: FONT_FAMILY }}>
                Investimento total: R$ {formatNumber(totalCost)}
            </Typography>
            
            {showEmailTrigger && <div style={{marginTop: '20px'}}>Componente de Email aqui</div>}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
            <Typography variant="h5" sx={{ fontFamily: FONT_FAMILY }}>
                Digite a quantidade de alunos e clique em Calcular.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BudgetCalculator;