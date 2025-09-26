import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Description,
  ShoppingCart,
  People,
  AttachMoney,
  LocalShipping,
  Assessment,
  FileDownload,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { dashboardService, type DashboardStats, type RecentActivity } from '../services/dashboardService';
import { ExportDialog } from '../components/ExportDialog';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const getStatCards = () => {
    if (!stats) return [];

    return [
      {
        title: 'Clientes Activos',
        value: formatNumber(stats.totalClients),
        icon: <People sx={{ fontSize: 40 }} />,
        color: '#1976d2',
      },
      {
        title: 'Contratos Vigentes',
        value: formatNumber(stats.activeContracts),
        icon: <Description sx={{ fontSize: 40 }} />,
        color: '#388e3c',
      },
      {
        title: 'Pedidos del Mes',
        value: formatNumber(stats.monthlyOrders),
        icon: <ShoppingCart sx={{ fontSize: 40 }} />,
        color: '#f57c00',
      },
      {
        title: 'Volumen Pendiente',
        value: `${formatNumber(stats.pendingVolume)} TM`,
        icon: <TrendingUp sx={{ fontSize: 40 }} />,
        color: '#7b1fa2',
      },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido al Sistema de Gestión de Contratos y Pedidos de Venta
          </Typography>
        </Box>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => setExportDialogOpen(true)}
            size="small"
          >
            Exportar Datos
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {getStatCards().map((stat, index) => (
          <Card key={index} elevation={2}>
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
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Additional Metrics */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <Box>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ color: '#4caf50', mr: 1 }} />
                  <Typography variant="h6">Métricas Financieras</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total de Contratos
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {formatCurrency(stats.totalContractValue)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ingresos del Mes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Promedio por Pedido
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(stats.averageOrderValue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ color: '#ff9800', mr: 1 }} />
                  <Typography variant="h6">Indicadores Operativos</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Volumen Atendido
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(stats.attendedVolume)} TM
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pedidos Pendientes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {formatNumber(stats.pendingOrders)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Cumplimiento
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stats.completionRate}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 35 }}>
                      {stats.completionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Description sx={{ mr: 1, color: '#1976d2' }} />
              Contratos Recientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity?.recentContracts.length ? (
              <List disablePadding>
                {recentActivity.recentContracts.map((contract) => (
                  <ListItem key={contract.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {contract.correlativeNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(contract.createdAt, 'dd/MM/yyyy', { locale: es })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {contract.clientName}
                          </Typography>
                          <Typography variant="caption" color="primary.main">
                            {formatNumber(contract.totalVolume)} TM
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay contratos registrados
              </Typography>
            )}
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1, color: '#f57c00' }} />
              Últimos Pedidos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity?.recentOrders.length ? (
              <List disablePadding>
                {recentActivity.recentOrders.map((order) => (
                  <ListItem key={order.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {order.contractNumber}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={order.status === 'pending' ? 'Pendiente' :
                                     order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                              size="small"
                              color={order.status === 'pending' ? 'warning' :
                                     order.status === 'delivered' ? 'success' : 'error'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {format(order.orderDate, 'dd/MM/yyyy', { locale: es })}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.clientName}
                          </Typography>
                          <Typography variant="caption" color="primary.main">
                            {formatNumber(order.volume)} TM - {formatCurrency(order.totalValue)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay pedidos registrados
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;