import React from 'react';
import { Container, Box, Typography, Button, } from '@mui/material';
import BudgetCalculator from '../components/BudgetCalculator';
import logo from '../assets/logo.png';

const EmailTriggerPage: React.FC = () => {

  const handleLogout = () => {
    localStorage.removeItem('@BudgetApp:token');
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, minHeight: '100vh' }}>
      {/* Header com logo + botão sair */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          mb: { xs: 4, md: 6 },
          position: 'relative',
          gap: { xs: 2, md: 0 } // espaço entre logo e botão em mobile
        }}
      >
        {/* Logo */}
        <Box sx={{ width: { xs: '280px', sm: '350px', md: '450px' }, mb: { xs: 1, md: 0 } }}>
          <img
            src={logo}
            alt="Logo Prodemge Desenvolve"
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        {/* Botão Sair */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            fontFamily: 'Conthrax',
            minWidth: { xs: '120px', md: 'auto' },
            px: { xs: 3, md: 4 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: '1rem', md: '1.1rem' },
            // Em mobile, não usa position absolute
            position: { md: 'absolute' },
            right: { md: 0 },
            top: { md: '50%' },
            transform: { md: 'translateY(-50%)' }
          }}
        >
          Sair
        </Button>
      </Box>

      {/* Título */}
      <Typography
        variant="h1"
        align="center"
        sx={{
          fontSize: { xs: '2rem', sm: '2.4rem', md: '2.7rem' },
          mb: { xs: 4, md: 5 },
          fontFamily: 'Conthrax, Arial, sans-serif'
        }}
      >
        Disparo de Orçamento por Email
      </Typography>

      {/* Calculadora */}
      <BudgetCalculator showEmailTrigger={true} />
    </Container>
  );
};

export default EmailTriggerPage;