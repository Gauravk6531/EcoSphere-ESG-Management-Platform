import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define a premium modern theme for EcoSphere ESG
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10b981', // Brand Emerald Green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Brand Ocean Blue
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Light slate
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate dark
      secondary: '#475569', // Slate grey
    },
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
    h4: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Outfit, sans-serif', fontWeight: 500 },
    h6: { fontFamily: 'Outfit, sans-serif', fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Smooth, modern pill-cards
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
