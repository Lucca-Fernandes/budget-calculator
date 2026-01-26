import React, { useState } from 'react';
import { Box, TextField, Button, Chip, Stack, Typography } from '@mui/material';

export const EmailManager: React.FC<{ fontFamily: string, primaryColor: string }> = ({ fontFamily, primaryColor }) => {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<{address: string, selected: boolean}[]>([]);

  const addEmail = () => {
    if (emailInput && !emails.find(e => e.address === emailInput)) {
      setEmails([...emails, { address: emailInput, selected: true }]);
      setEmailInput('');
    }
  };

  const toggleSelect = (index: number) => {
    const newEmails = [...emails];
    newEmails[index].selected = !newEmails[index].selected;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography sx={{ fontFamily, mb: 2, fontWeight: 'bold' }}>Gerenciar Destinatários</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField 
          label="Novo Email" 
          value={emailInput} 
          onChange={(e) => setEmailInput(e.target.value)}
          fullWidth
        />
        <Button onClick={addEmail} variant="contained" sx={{ bgcolor: primaryColor }}>Adicionar</Button>
      </Stack>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {emails.map((email, index) => (
          <Chip 
            key={index}
            label={email.address}
            onDelete={() => removeEmail(index)}
            onClick={() => toggleSelect(index)}
            color={email.selected ? "primary" : "default"}
            sx={{ fontFamily }}
          />
        ))}
      </Box>

      {emails.length > 0 && (
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mt: 3, bgcolor: '#2e7d32', fontFamily }}
          onClick={() => alert('Emails disparados!')}
        >
          Enviar Orçamento para Selecionados
        </Button>
      )}
    </Box>
  );
};