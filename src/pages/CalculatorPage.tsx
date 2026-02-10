import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import BudgetCalculator from '../components/BudgetCalculator';
import logo from '../assets/logo.png';
import Footer from '../components/Footer';

const CalculatorPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',           // página ocupa altura total da viewport
      }}
    >
      {/* Conteúdo principal – cresce com flex: 1 */}
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          {/* Logo responsivo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 4, md: 6 },
            }}
          >
            <img
              src={logo}
              alt="Logo Prodemge Desenvolve"
              style={{
                width: '100%',
                maxWidth: '450px',
                height: 'auto',
              }}
            />
          </Box>

          {/* Título */}
          <Typography
            variant="h1"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.7rem' },
              fontFamily: 'Conthrax, Arial, sans-serif',
              mb: { xs: 4, md: 6 },
            }}
          >
            Calculadora de Orçamento
          </Typography>

          {/* Calculadora */}
          <BudgetCalculator />
        </Container>
      </Box>

      {/* Footer sempre no final da página */}
      <Footer />
    </Box>
  );
};

export default CalculatorPage;