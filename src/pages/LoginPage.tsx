import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!user || !pass) {
      toast.warn("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('@BudgetApp:token', data.token);
        toast.success("Login realizado!");
        onLoginSuccess();
      } else {
        toast.error(data.message || "Erro no login");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <ToastContainer />
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3, fontFamily: 'Conthrax', fontWeight: 'bold' }}>
          Acesso Restrito
        </Typography>
        <TextField 
          fullWidth label="Usuário" sx={{ mb: 2 }} 
          value={user} onChange={(e) => setUser(e.target.value)} 
        />
        <TextField 
          fullWidth label="Senha" type="password" sx={{ mb: 3 }} 
          value={pass} onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <Button 
          fullWidth variant="contained" 
          disabled={loading}
          onClick={handleLogin} 
          sx={{ bgcolor: '#9100ff', py: 1.5, '&:hover': { bgcolor: '#7a00d6' } }}
        >
          {loading ? "Autenticando..." : "Entrar"}
        </Button>
      </Paper>
    </Box>
  );
};