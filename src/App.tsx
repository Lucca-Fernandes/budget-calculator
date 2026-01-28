import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppRoutes } from './routes/AppRoutes';
import { CssBaseline } from '@mui/material';

const appTheme = createTheme({
  palette: {
    primary: {
      main: '#9100ff', // Ajustado para o roxo do seu projeto
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Conthrax, Arial, sans-serif', 
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginTop: '1rem',
      marginBottom: '1rem',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;