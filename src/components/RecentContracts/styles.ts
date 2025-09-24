import { Box, Paper, styled } from '@mui/material';

export const RecentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2)
}));

export const ContractItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

export const ContractMainInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1
}));

export const ContractIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

export const ContractInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 2
});

export const ContractMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary
}));

export const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 120
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  color: theme.palette.text.secondary
}));