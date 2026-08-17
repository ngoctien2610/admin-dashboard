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

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#4f46e5' },
          secondary: { main: '#0ea5e9' },
          background: {
            default: mode === 'light' ? '#f4f6fb' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#111827',
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(', '),
          button: {
            textTransform: 'none',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.35s ease, color 0.35s ease',
                minHeight: '100vh',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.35s ease, color 0.35s ease',
                borderRadius: 20,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                borderBottom: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
              },
            },
          },
        },
      }),
    [mode]
  );

  React.useEffect(() => {
    window.localStorage.setItem('appTheme', mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={<Layout mode={mode} onToggleTheme={() => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))} />}
        >
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
