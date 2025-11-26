import { ThemeProvider, createTheme } from '@mui/material/styles';
import Calculator from "./components/Calculator";

// Definição do tema para usar a fonte Conthrax
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
    // Definindo a fonte Conthrax como padrão para toda a tipografia
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
    // O Calculator.tsx agora usa estilos inline (sx) para tamanhos de texto ainda maiores
  },
});

function App() {
  return (
    // Certifique-se de que o ThemeProvider esteja aqui
    <ThemeProvider theme={appTheme}>
      <Calculator/>
    </ThemeProvider>
  );
}

export default App;