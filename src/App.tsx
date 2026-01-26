import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalculatorPage from './pages/CalculatorPage';

const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
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
      <CalculatorPage/>
    </ThemeProvider>
  );
}

export default App;