import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalculatorPage from './pages/CalculatorPage';
import CssBaseline from '@mui/material/CssBaseline'; // ← IMPORTANTE!
import { Box } from '@mui/material';

const appTheme = createTheme({
  palette: {
    primary: {
      main: '#9100ff', // ajustei para combinar com sua cor principal
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
      {/* CssBaseline remove margens/paddings padrão do body/html */}
      <CssBaseline />
      
      {/* Box root com altura total e flex */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <CalculatorPage />
      </Box>
    </ThemeProvider>
  );
}

export default App;