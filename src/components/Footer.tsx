import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#9100ff',
        color: '#fff',
        py: { xs: 3, md: 4 },
        mt: 'auto', 
        textAlign: 'center',
        borderTop: '3px solid #9100ff',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Conthrax, Arial, sans-serif',
          fontWeight: 500,
          letterSpacing: '0.5px',
          fontSize: { xs: '0.85rem', sm: '0.95rem' },
        }}
      >
        © {new Date().getFullYear()} Prodemge Desenvolve. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;