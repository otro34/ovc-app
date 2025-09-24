import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  Description,
  ShoppingCart,
  People,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Clientes Activos',
      value: '0',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Contratos Vigentes',
      value: '0',
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: 'Pedidos del Mes',
      value: '0',
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#f57c00',
    },
    {
      title: 'Volumen Pendiente',
      value: '0 TM',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Bienvenido al Sistema de Gestión de Contratos y Pedidos de Venta
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
          mt: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Contratos Recientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay contratos registrados
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Últimos Pedidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay pedidos registrados
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;