import React from 'react';
import { Box, TextField, Button } from '@mui/material';

interface Props {
  currentDate: string;
  setCurrentDate: (v: string) => void;
  studentsInput: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCalculate: () => void;
  fontFamily: string;
  primaryColor: string;
}

export const BudgetForm: React.FC<Props> = ({ 
  currentDate, setCurrentDate, studentsInput, handleInputChange, handleCalculate, fontFamily, primaryColor 
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 6, mb: 6 }}>
    <TextField
      label="Data da Assinatura"
      type="date"
      value={currentDate}
      onChange={(e) => setCurrentDate(e.target.value)}
      InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily } }}
      inputProps={{ sx: { fontSize: '1.4rem', fontFamily, m: 0.5 } }}
      fullWidth
    />
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
      <TextField
        label="Quantidade de Alunos"
        type="text"
        placeholder="Digite a quantidade"
        value={studentsInput}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontFamily } }}
        inputProps={{
            inputMode: 'numeric',
            sx: { fontSize: '1.5rem', fontFamily, m: 0.5 }
        }}
        fullWidth
        onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
      />
      <Button 
        variant="contained" 
        onClick={handleCalculate}
        sx={{ 
          fontFamily, fontSize: '1.2rem', px: 4, fontWeight: 'bold', 
          backgroundColor: primaryColor, '&:hover': { backgroundColor: '#7200c9' } 
        }}
      >
        Calcular
      </Button>
    </Box>
  </Box>
);