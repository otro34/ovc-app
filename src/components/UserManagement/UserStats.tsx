import React from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { User } from '../../services/database';

interface UserStatsProps {
  users: User[];
}

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  const totalUsers = users.length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

  // Usuarios creados en los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = users.filter(user =>
    user.createdAt && new Date(user.createdAt) > thirtyDaysAgo
  ).length;

  const statsCards = [
    {
      title: 'Total de Usuarios',
      value: totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      backgroundColor: '#e3f2fd',
    },
    {
      title: 'Administradores',
      value: adminCount,
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      backgroundColor: '#ffebee',
    },
    {
      title: 'Usuarios Normales',
      value: userCount,
      icon: <UserIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      backgroundColor: '#e8f5e8',
    },
    {
      title: 'Nuevos (30 días)',
      value: recentUsers,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      backgroundColor: '#fff3e0',
    },
  ];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ flexWrap: 'wrap' }}
    >
      {statsCards.map((card, index) => (
        <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '1 1 25%' }, minWidth: 0 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: card.color, fontWeight: 'bold' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: card.backgroundColor,
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Stack>
  );
};