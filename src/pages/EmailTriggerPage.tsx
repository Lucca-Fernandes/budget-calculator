import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import BudgetCalculator from '../components/BudgetCalculator';
import logo from '../assets/logo.png';

const EmailTriggerPage: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('@BudgetApp:token');
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Box sx={{ width: '450px' }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
        </Box>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleLogout}
          sx={{ fontFamily: 'Conthrax' }}
        >
          Sair
        </Button>
      </Box>

      <Typography variant="h1" align="center" sx={{ fontSize: '2.7rem', mb: 4 }}>
        Disparo de Orçamento por Email
      </Typography>

      <BudgetCalculator showEmailTrigger={true} />
    </Container>
  );
};

export default EmailTriggerPage;