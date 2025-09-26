import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SessionTimeout } from './components/SessionTimeout';
import './services/automatedTasks'; // Inicializar tareas automáticas
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { Clients } from './pages/Clients';
import Contracts from './pages/Contracts';
import PurchaseOrders from './pages/PurchaseOrders';
import Administration from './pages/Administration';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="contratos" element={<Contracts />} />
              <Route path="pedidos" element={<PurchaseOrders />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <Administration />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<div>No tienes permisos para acceder a esta página</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <SessionTimeout />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
