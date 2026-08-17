import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const stored = window.localStorage.getItem('appTheme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#5664f5', light: '#eef0ff', dark: '#3d49c7' },
      secondary: { main: '#16b8a6' },
      background: { default: mode === 'light' ? '#f6f7fb' : '#0c1220', paper: mode === 'light' ? '#ffffff' : '#121a2a' },
      text: { primary: mode === 'light' ? '#172033' : '#f4f7ff', secondary: mode === 'light' ? '#667085' : '#aab4c7' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Inter, Roboto, sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.03em' },
      h5: { fontWeight: 800, letterSpacing: '-0.02em' },
      h6: { fontWeight: 750 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { minHeight: '100vh', transition: 'background-color .25s ease, color .25s ease' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${mode === 'light' ? '#e8ebf2' : '#263249'}`, boxShadow: mode === 'light' ? '0 8px 28px rgba(24, 35, 70, .05)' : '0 10px 30px rgba(0, 0, 0, .2)' } } },
      MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 10, boxShadow: 'none' } } },
      MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 700, borderRadius: 8 } } },
    },
  }), [mode]);

  React.useEffect(() => { window.localStorage.setItem('appTheme', mode); }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout mode={mode} onToggleTheme={() => setMode((prev) => prev === 'light' ? 'dark' : 'light')} />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:productId" element={<ProductDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
