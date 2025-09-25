import { styled } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';

export const DetailsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: (typeof theme.shape.borderRadius === 'number') ? theme.shape.borderRadius * 2 : '8px',
  boxShadow: theme.shadows[2],
  maxHeight: '80vh',
  overflow: 'auto'
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

export const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

export const InfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

export const InfoCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  '&.primary': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.success': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.warning': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  '&.error': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  }
}));

export const ProgressSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

export const PurchaseOrdersSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

export const PurchaseOrderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

export const ActionsSection = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end'
}));

export const StatusChip = styled(Box)<{ status: string }>(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  borderRadius: (typeof theme.shape.borderRadius === 'number') ? theme.shape.borderRadius * 3 : '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor:
    status === 'active' ? theme.palette.success.light :
    status === 'completed' ? theme.palette.info.light :
    status === 'cancelled' ? theme.palette.error.light :
    theme.palette.grey[300],
  color:
    status === 'active' ? theme.palette.success.contrastText :
    status === 'completed' ? theme.palette.info.contrastText :
    status === 'cancelled' ? theme.palette.error.contrastText :
    theme.palette.text.primary,
}));