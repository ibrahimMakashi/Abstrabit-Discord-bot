import { alpha, Box, Grid, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { appBackground, brand } from '../constants/colors';

const BackgroundBlobs = () => (
  <>
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: appBackground.gradient,
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        width: 520,
        height: 520,
        borderRadius: '50%',
        top: '-8%',
        right: '6%',
        background: 'linear-gradient(135deg, rgba(45,107,87,0.28), rgba(209,234,226,0.5))',
        filter: 'blur(90px)',
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        width: 460,
        height: 460,
        borderRadius: '50%',
        bottom: '-6%',
        left: '4%',
        background: 'linear-gradient(135deg, rgba(58,133,112,0.22), rgba(209,234,226,0.45))',
        filter: 'blur(95px)',
        pointerEvents: 'none',
      }}
    />
  </>
);

const AuthLayout = ({
  heroStat = '24/7',
  heroTitle,
  heroHighlight,
  heroDescription,
  children,
}) => (
  <Box
    sx={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: brand.mint,
      py: { xs: 3, md: 5 },
    }}
  >
    <BackgroundBlobs />

    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1280,
        mx: 'auto',
        px: { xs: 3, sm: 5, md: 8, lg: 10, xl: 12 },
      }}
    >
      <Grid
        container
        spacing={{ xs: 4, lg: 8 }}
        sx={{
          minHeight: { md: 'calc(100vh - 80px)' },
          alignItems: 'center',
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
            <Stack spacing={3} sx={{ maxWidth: 520, py: { md: 2 } }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '4rem', md: '5.5rem' },
                    fontWeight: 800,
                    lineHeight: 0.95,
                    color: brand.text,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {heroStat}
                </Typography>
                <Box sx={{ width: 72, height: 4, bgcolor: brand.primary, borderRadius: 999, mt: 1.5 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: brand.text,
                }}
              >
                {heroTitle}{' '}
                <Box component="span" sx={{ color: brand.primary }}>
                  {heroHighlight}
                </Box>
              </Typography>

              <Typography sx={{ color: alpha(brand.text, 0.62), fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 460 }}>
                {heroDescription}
              </Typography>
            </Stack>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
            {children}
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default AuthLayout;
