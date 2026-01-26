import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import BudgetCalculator from '../components/BudgetCalculator';
import logo from '../assets/logo.png';

const CalculatorPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <img src={logo} alt="Logo" style={{ width: '450px', height: '100px' }} />
      </Box>
      <Typography variant="h1" align="center" sx={{ fontSize: '2.7rem', fontFamily: 'Conthrax, Arial, sans-serif' }}>
        Calculadora de Orçamento
      </Typography>
      <BudgetCalculator />
    </Container>
  );
};

export default CalculatorPage;