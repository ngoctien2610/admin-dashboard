import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Analytics from "./pages/Analytics";
import AuditLog from "./pages/AuditLog";
import Rbac from "./pages/Rbac";
import PermissionGate from "./components/PermissionGate";
import UserDetail from "./pages/UserDetail";
import OrderDetail from "./pages/OrderDetail";
import Inventory from "./pages/Inventory";
import Operations from "./pages/Operations";
import Login from "./pages/Login";
import { AuthProvider, RequireAuth } from "./auth/AuthContext";

export default function App() {
  const [mode, setMode] = React.useState<"light" | "dark">(() => {
    const stored = window.localStorage.getItem("appTheme");
    return stored === "dark" ? "dark" : "light";
  });

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#087f73", light: "#e0f3ef", dark: "#07534e" },
          secondary: { main: "#e56f55", light: "#fff0eb", dark: "#a94735" },
          background: {
            default: mode === "light" ? "#f4f7f5" : "#0d1716",
            paper: mode === "light" ? "#ffffff" : "#142220",
          },
          text: {
            primary: mode === "light" ? "#172b29" : "#eff8f5",
            secondary: mode === "light" ? "#63736f" : "#a8bbb6",
          },
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: '"DM Sans", "Segoe UI", sans-serif',
          h1: { fontFamily: '"Manrope", sans-serif', fontWeight: 800 },
          h2: { fontFamily: '"Manrope", sans-serif', fontWeight: 800 },
          h3: { fontFamily: '"Manrope", sans-serif', fontWeight: 800 },
          h4: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
          },
          h5: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.02em",
          },
          h6: { fontWeight: 750 },
          button: { textTransform: "none", fontWeight: 700 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                minHeight: "100vh",
                transition: "background-color .25s ease, color .25s ease",
                backgroundImage:
                  mode === "light"
                    ? "linear-gradient(rgba(8, 127, 115, .025) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 127, 115, .025) 1px, transparent 1px)"
                    : "none",
                backgroundSize: "32px 32px",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                border: `1px solid ${mode === "light" ? "#e8ebf2" : "#263249"}`,
                boxShadow:
                  mode === "light"
                    ? "0 12px 32px rgba(23, 43, 41, .055)"
                    : "0 10px 30px rgba(0, 0, 0, .2)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: { backgroundImage: "none", overflow: "hidden" },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 11,
                boxShadow: "none",
                minHeight: 42,
                "&:hover": { boxShadow: "0 8px 18px rgba(8, 127, 115, .16)" },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: { "& .MuiOutlinedInput-root": { borderRadius: 10 } },
            },
          },
          MuiChip: {
            styleOverrides: { root: { fontWeight: 700, borderRadius: 8 } },
          },
        },
      }),
    [mode],
  );

  React.useEffect(() => {
    window.localStorage.setItem("appTheme", mode);
  }, [mode]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout
                  mode={mode}
                  onToggleTheme={() =>
                    setMode((prev) => (prev === "light" ? "dark" : "light"))
                  }
                />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:productId" element={<ProductDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="operations" element={<Operations />} />
            <Route
              path="analytics"
              element={
                <PermissionGate permission="analytics.view">
                  <Analytics />
                </PermissionGate>
              }
            />
            <Route
              path="audit-log"
              element={
                <PermissionGate permission="audit.view">
                  <AuditLog />
                </PermissionGate>
              }
            />
            <Route
              path="rbac"
              element={
                <PermissionGate permission="rbac.manage">
                  <Rbac />
                </PermissionGate>
              }
            />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
