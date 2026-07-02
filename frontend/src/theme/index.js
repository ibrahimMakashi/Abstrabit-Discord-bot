import { createTheme } from '@mui/material/styles';
import { brand } from '../constants/colors';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brand.primary, dark: brand.primaryDark, light: brand.primaryLight },
    secondary: { main: brand.mint },
    background: {
      default: brand.mint,
      paper: brand.content,
    },
    success: { main: '#3A8570' },
    warning: { main: '#D4A054' },
    error: { main: '#C75C5C' },
    text: {
      primary: brand.text,
      secondary: brand.textMuted,
    },
    divider: '#DCE8E3',
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'sans-serif'].join(','),
    h3: { fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em' },
    h4: { fontWeight: 800, fontSize: '1.65rem', letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, fontSize: '1.2rem' },
    h6: { fontWeight: 700, fontSize: '1rem' },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
    body2: { fontSize: '0.875rem' },
    caption: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 28,
          border: 'none',
          boxShadow: '0 12px 36px rgba(45, 107, 87, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 24,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: brand.primary,
          borderRight: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          paddingInline: 20,
        },
        contained: {
          backgroundColor: brand.primary,
          color: brand.white,
          '&:hover': {
            backgroundColor: brand.primaryDark,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 999,
            backgroundColor: brand.white,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
  },
});
