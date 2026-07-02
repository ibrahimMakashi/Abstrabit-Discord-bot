import { Box } from '@mui/material';

const GlassAuthCard = ({ children, sx }) => (
  <Box
    sx={{
      width: '100%',
      maxWidth: 440,
      mx: { xs: 'auto', md: 0 },
      ml: { md: 'auto' },
      mr: { md: 0 },
      p: { xs: 3, sm: 4 },
      borderRadius: '32px',
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.9)',
      boxShadow: '0 28px 80px rgba(45, 107, 87, 0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default GlassAuthCard;
