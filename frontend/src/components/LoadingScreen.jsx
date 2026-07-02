import { alpha } from '@mui/material/styles';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import { appBackground, brand } from '../constants/colors';

const MotionBox = motion.create(Box);

const orbitTransition = {
  repeat: Number.POSITIVE_INFINITY,
  duration: 2.8,
  ease: 'linear',
};

const LoadingScreen = ({ message = 'Loading dashboard...' }) => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      background: appBackground.gradient,
    }}
  >
    <Stack
      spacing={3}
      alignItems="center"
      sx={{
        position: 'relative',
        zIndex: 1,
        px: 4,
        py: 4,
        borderRadius: '32px',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 28px 80px rgba(45, 107, 87, 0.14)',
        minWidth: { xs: 280, sm: 340 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 104,
          height: 104,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: brand.mintLight,
          border: `1px solid ${alpha(brand.primary, 0.12)}`,
        }}
      >
        <MotionBox
          animate={{ rotate: 360 }}
          transition={orbitTransition}
          sx={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: `2px solid ${alpha(brand.primary, 0.2)}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -5,
              left: '50%',
              width: 10,
              height: 10,
              ml: '-5px',
              borderRadius: '50%',
              bgcolor: brand.primary,
            }}
          />
        </MotionBox>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(brand.primary, 0.12),
            color: brand.primary,
          }}
        >
          <SmartToyRoundedIcon />
        </Box>
      </Box>

      <Stack spacing={0.75} alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 800, color: brand.text }}>
          Preparing your workspace
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ maxWidth: 260 }}>
          {message}
        </Typography>
        <CircularProgress size={22} thickness={5} sx={{ color: brand.primary, mt: 0.5 }} />
      </Stack>
    </Stack>
  </Box>
);

export default LoadingScreen;
