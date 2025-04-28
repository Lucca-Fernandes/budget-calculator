import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Container,
  Switch,
  FormControlLabel,
} from '@mui/material';

// Importar a logo
import logo from '../assets/logo.png';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h1: {
      fontSize: '2.2rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
      marginTop: '1.5rem',
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  },
});

const Calculator: React.FC = () => {
  // Estados para os inputs
  const [habitants, setHabitants] = useState<number>(0);
  const [students, setStudents] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>('2025-04-28'); // Data atual como padrão
  const [usePredefinedBudget, setUsePredefinedBudget] = useState<boolean>(false); // Estado do switch
  const [predefinedBudget, setPredefinedBudget] = useState<number>(0); // Orçamento pré-definido

  // Função para validar e atualizar a quantidade de habitantes
  const handleHabitantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números inteiros positivos
    if (/^\d*$/.test(value)) {
      setHabitants(Number(value));
    }
  };

  // Função para validar e atualizar a quantidade de alunos
  const handleStudentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números inteiros positivos
    if (/^\d*$/.test(value)) {
      setStudents(Number(value));
    }
  };

  // Função para validar e atualizar o orçamento pré-definido
  const handlePredefinedBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números inteiros positivos
    if (/^\d*$/.test(value)) {
      setPredefinedBudget(Number(value));
    }
  };

  // Função para formatar números no padrão brasileiro (ex.: 7500000.00 -> 7.500.000,00)
  const formatNumber = (value: number): string => {
    const [integerPart, decimalPart] = value.toFixed(2).split('.');
    // Adiciona pontos como separadores de milhar
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    // Substitui o ponto decimal por vírgula
    return `${formattedInteger},${decimalPart}`;
  };

  // Cálculo do público e custo total com base no modo (orçamento pré-definido ou habitantes)
  const publicCount = usePredefinedBudget ? 0 : habitants * 0.005; // Não calculamos público se usarmos orçamento pré-definido
  const baseCostPerStudent = 30000;
  const totalCost = usePredefinedBudget ? predefinedBudget : students * baseCostPerStudent;

  // Calcular a quantidade de alunos possíveis com base no orçamento pré-definido
  const possibleStudents = usePredefinedBudget ? Math.floor(predefinedBudget / baseCostPerStudent) : 0;

  // Cálculo do orçamento
  const entryFee = totalCost * 0.1; // 10% de entrada
  const deliveryFee = totalCost * 0.1; // 10% na entrega
  const remainingCost = totalCost - entryFee - deliveryFee; // Valor restante

  // Cálculo das parcelas com base na data
  const selectedDate = new Date(currentDate);
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth(); // 0 a 11 (janeiro é 0)

  // Total de parcelas mensais (excluindo entrada e entrega)
  const totalMonthlyParcels = 24; // 26 parcelas totais - 1 entrada - 1 entrega = 24 parcelas mensais

  // Calcular a data final (adicionar 24 meses à data inicial)
  const endDate = new Date(selectedDate);
  endDate.setMonth(selectedDate.getMonth() + totalMonthlyParcels);
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth(); // 0 a 11

  // Calcular o valor da parcela mensal
  const monthlyPayment = remainingCost / totalMonthlyParcels;

  // Calcular os totais por ano entre o ano inicial e o ano final
  const yearlyPayments: { year: number; months: number; total: number }[] = [];

  // Iterar pelos anos entre selectedYear e endYear
  for (let year = selectedYear; year <= endYear; year++) {
    let monthsInYear = 0;

    if (year === selectedYear) {
      // Primeiro ano: meses restantes a partir do mês inicial
      monthsInYear = 12 - (selectedMonth + 1);
    } else if (year === endYear) {
      // Último ano: meses até o mês final
      monthsInYear = endMonth + 1;
    } else {
      // Anos intermediários: 12 meses
      monthsInYear = 12;
    }

    // Ajustar para não exceder o total de 24 parcelas
    const totalMonthsSoFar = yearlyPayments.reduce((sum, payment) => sum + payment.months, 0);
    if (totalMonthsSoFar + monthsInYear > totalMonthlyParcels) {
      monthsInYear = totalMonthlyParcels - totalMonthsSoFar;
    }

    if (monthsInYear > 0) {
      const totalForYear = monthlyPayment * monthsInYear;
      yearlyPayments.push({ year, months: monthsInYear, total: totalForYear });
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Logo acima do título */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <img
            src={logo}
            alt="Logo Calculadora"
            style={{ width: '250px', height: '50px' }}
          />
        </Box>

        <Typography variant="h1" align="center" color="black">
          Calculadora de Orçamento
        </Typography>

        {/* Switch para "Orçamento pré-definido" no canto superior direito */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={usePredefinedBudget}
                onChange={(e) => setUsePredefinedBudget(e.target.checked)}
                color="secondary"
              />
            }
            label="Orçamento pré-definido"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          {/* Input para a data atual */}
          <TextField
            label="Data Atual"
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Input para quantidade de habitantes (desabilitado se usar orçamento pré-definido) */}
          <TextField
            label="Quantidade de Habitantes"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
            value={habitants}
            onChange={handleHabitantsChange}
            placeholder="Digite um número"
            fullWidth
            disabled={usePredefinedBudget}
          />

          {/* Input para o orçamento pré-definido (habilitado apenas se o switch estiver ativado) */}
          <TextField
            label="Orçamento"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
            value={predefinedBudget}
            onChange={handlePredefinedBudgetChange}
            placeholder="Digite o orçamento"
            fullWidth
            disabled={!usePredefinedBudget}
          />

          {/* Input para quantidade de alunos (desabilitado se usar orçamento pré-definido) */}
          <TextField
            label="Quantidade de Alunos"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
            value={students}
            onChange={handleStudentsChange}
            placeholder="Digite um número"
            fullWidth
            disabled={usePredefinedBudget}
          />
        </Box>

        {/* Seção de Resultados, Orçamento e Parcelas em boxes separados */}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Resultados */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h3">Resultados</Typography>
            {!usePredefinedBudget && (
              <Typography variant="body1">
                Público (0,5% dos habitantes): {formatNumber(publicCount)}
              </Typography>
            )}
            {usePredefinedBudget && (
              <Typography variant="body1">
                Quantidade de Alunos Possíveis: {possibleStudents}
              </Typography>
            )}
            <Typography variant="body1">
              Custo Total: R$ {formatNumber(totalCost)}
            </Typography>
          </Paper>

          {/* Orçamento */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h3">Orçamento</Typography>
            <Typography variant="body1">
              Entrada (10%): R$ {formatNumber(entryFee)}
            </Typography>
            <Typography variant="body1">
              Entrega (10%): R$ {formatNumber(deliveryFee)}
            </Typography>
            <Typography variant="body1">
              Valor Restante: R$ {formatNumber(remainingCost)}
            </Typography>
          </Paper>

          {/* Parcelas */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h3">Parcelas</Typography>
            {yearlyPayments.length > 0 ? (
              <>
                <Typography variant="body1">
                  Parcela Mensal: R$ {formatNumber(monthlyPayment)}
                </Typography>
                {yearlyPayments.map((payment) => (
                  <Typography key={payment.year} variant="body1">
                    Total em {payment.year} ({payment.months} meses): R$ {formatNumber(payment.total)}
                  </Typography>
                ))}
              </>
            ) : (
              <Typography variant="body1">
                Nenhuma parcela disponível.
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Calculator;