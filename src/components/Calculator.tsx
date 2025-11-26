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

const Calculator: React.FC = () => {
  const [students, setStudents] = useState<number>(150);
  const [currentDate, setCurrentDate] = useState<string>(getFormattedCurrentDate()); 

  const handleStudentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setStudents(Number(value));
    }
  };


  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  };

  const baseCostPerStudent = 31500;
  const totalCost = students * baseCostPerStudent;

  const entryFee = totalCost * 0.1;
  const deliveryFee = totalCost * 0.1;
  const remainingCost = totalCost - entryFee - deliveryFee;

  const selectedDate = new Date(currentDate);
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  const totalMonthlyParcels = 24;

  const endDate = new Date(selectedDate);
  endDate.setMonth(selectedDate.getMonth() + totalMonthlyParcels);

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  const monthlyPayment = remainingCost / totalMonthlyParcels;

  const yearlyPayments: { year: number; months: number; total: number }[] = [];
  let totalMonthsCounted = 0;

  for (let year = selectedYear; year <= endYear; year++) {
    let monthsInYear = 0;

    if (year === selectedYear) {
      monthsInYear = 12 - (selectedMonth + 1);
    } else if (year === endYear) {
      monthsInYear = endMonth + 1;
    } else {
      monthsInYear = 12;
    }

    if (totalMonthsCounted + monthsInYear > totalMonthlyParcels) {
      monthsInYear = totalMonthlyParcels - totalMonthsCounted;
    }

    if (monthsInYear > 0) {
      const totalForYear = monthlyPayment * monthsInYear;
      yearlyPayments.push({ year, months: monthsInYear, total: totalForYear });
      totalMonthsCounted += monthsInYear;
    }

    if (totalMonthsCounted >= totalMonthlyParcels) break;
  }

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
          // Estilos inline e sx removidos daqui, pois estão no Box pai
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
          label="Data de Início"
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
            1º Entrada (10%): <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(entryFee)}</span>
          </Typography>

          <Typography variant="body1" sx={{ fontSize: '1.4rem', mb: 3, fontFamily: FONT_FAMILY, ml: 0.3 }}>
            2º Entrada (10%): <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(deliveryFee)}</span>
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
            Custo Total: <span style={{ whiteSpace: 'nowrap' }}>R$ {formatNumber(totalCost)}</span>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Calculator;