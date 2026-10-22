import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  BugReport,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Navigate based on role
      const dashboardMap = {
        USER: '/dashboard',
        AGENT: '/agent',
        ADMIN: '/admin',
      };
      navigate(dashboardMap[data.user.role] || '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: 2.5,
        zIndex: 1,
      }}
    >
      <Card
        className="animate-scaleUp"
        sx={{
          maxWidth: 450,
          width: '100%',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                mb: 2,
              }}
            >
              <BugReport sx={{ fontSize: 36, color: '#FFFFFF' }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #818CF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              ComplaintDesk
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Welcome back! Please sign in to continue
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#FB7185',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#818CF8' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#818CF8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#94A3B8' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Typography
                  component={RouterLink}
                  to="/forgot-password"
                  variant="caption"
                  sx={{
                    color: '#818CF8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 0.2s',
                    '&:hover': { color: '#A78BFA', textDecoration: 'underline' },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                fullWidth
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Don't have an account?{' '}
              <Typography
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{
                  color: '#818CF8',
                  textDecoration: 'none',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#A78BFA', textDecoration: 'underline' },
                }}
              >
                Sign Up
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
