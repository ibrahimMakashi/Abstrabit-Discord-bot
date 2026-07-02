import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, Divider, InputAdornment, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AuthLayout from '../components/AuthLayout';
import GlassAuthCard from '../components/GlassAuthCard';
import AuthTextField from '../components/AuthTextField';
import { brand } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { registerSchema } from '../utils/validators';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    try {
      await register(values);
      showSnackbar('Admin registered. You can sign in now.', 'success');
      registerForm.reset();
      navigate('/login');
    } catch (error) {
      showSnackbar(error.message || 'Registration failed', 'error');
    }
  });

  return (
    <AuthLayout
      heroStat="100%"
      heroTitle="Secure Admin"
      heroHighlight="Access"
      heroDescription="Create your dashboard account to manage Discord reports, analytics, settings, and realtime bot visibility from one modern control panel."
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
              Join us!
            </Typography>
            <Typography sx={{ mt: 1.25, color: alpha(brand.text, 0.58), fontSize: '1rem', lineHeight: 1.6 }}>
              Create your admin account and start managing your Discord bot.
            </Typography>
          </Box>

          <Stack component="form" spacing={2.25} onSubmit={handleRegister} autoComplete="on">
            <AuthTextField
              control={registerForm.control}
              name="name"
              label="Full Name"
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon fontSize="small" sx={{ color: brand.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <AuthTextField
              control={registerForm.control}
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
              control={registerForm.control}
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
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
              disabled={registerForm.formState.isSubmitting}
              sx={{
                mt: 0.5,
                py: 1.35,
                borderRadius: 999,
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 16px 36px rgba(45, 107, 87, 0.28)',
              }}
            >
              Create Account
            </Button>
          </Stack>

          <Divider sx={{ '&::before, &::after': { borderColor: '#DCE8E3' } }}>
            <Typography variant="caption" sx={{ color: brand.textMuted, fontWeight: 600 }}>
              already registered?
            </Typography>
          </Divider>

          <Typography variant="body2" sx={{ textAlign: 'center', color: alpha(brand.text, 0.58) }}>
            Already have an account?{' '}
            <Typography
              component={Link}
              to="/login"
              sx={{ color: brand.primary, fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign in here
            </Typography>
          </Typography>
        </Stack>
      </GlassAuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
