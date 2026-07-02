import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, Divider, InputAdornment, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AuthLayout from '../components/AuthLayout';
import GlassAuthCard from '../components/GlassAuthCard';
import AuthTextField from '../components/AuthTextField';
import { brand } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { loginSchema } from '../utils/validators';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    try {
      await login(values);
      showSnackbar('Welcome back.', 'success');
      navigate('/');
    } catch (error) {
      showSnackbar(error.message || 'Login failed', 'error');
    }
  });

  return (
    <AuthLayout
      heroStat="24/7"
      heroTitle="Discord Bot"
      heroHighlight="Dashboard"
      heroDescription="Monitor slash commands, triage reports, and manage bot operations with a secure admin console built for clarity and speed."
    >
      <GlassAuthCard>
        <Stack spacing={3}>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem' },
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: brand.text,
              }}
            >
              Hello!
            </Typography>
            <Typography sx={{ mt: 1.25, color: alpha(brand.text, 0.58), fontSize: '1rem', lineHeight: 1.6 }}>
              We are really happy to see you again!
            </Typography>
          </Box>

          <Stack component="form" spacing={2.25} onSubmit={handleLogin} autoComplete="on">
            <AuthTextField
              control={loginForm.control}
              name="email"
              label="Email"
              autoComplete="email"
              inputMode="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon fontSize="small" sx={{ color: brand.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <AuthTextField
              control={loginForm.control}
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon fontSize="small" sx={{ color: brand.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loginForm.formState.isSubmitting}
              sx={{
                mt: 0.5,
                py: 1.35,
                borderRadius: 999,
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 16px 36px rgba(45, 107, 87, 0.28)',
              }}
            >
              Sign In
            </Button>
          </Stack>

          <Divider sx={{ '&::before, &::after': { borderColor: '#DCE8E3' } }}>
            <Typography variant="caption" sx={{ color: brand.textMuted, fontWeight: 600 }}>
              or continue with
            </Typography>
          </Divider>

          <Typography variant="body2" sx={{ textAlign: 'center', color: alpha(brand.text, 0.58) }}>
            Need an admin account?{' '}
            <Typography
              component={Link}
              to="/register"
              sx={{ color: brand.primary, fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Create one here
            </Typography>
          </Typography>
        </Stack>
      </GlassAuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
