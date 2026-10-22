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
  MenuItem,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  HowToReg,
  BugReport,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    role: 'USER',
  });
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const data = await register(submitData);
      toast.success(`Welcome, ${data.user.name}! Account created.`);

      const dashboardMap = {
        USER: '/dashboard',
        AGENT: '/agent',
        ADMIN: '/admin',
      };
      navigate(dashboardMap[data.user.role] || '/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const subErrors = err.response?.data?.errors;
      let msg = serverMsg || 'Registration failed';
      if (subErrors && subErrors.length > 0) {
        msg = subErrors.map((e) => e.message).join(' • ');
      }
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
          maxWidth: 500,
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
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                mb: 2,
              }}
            >
              <BugReport sx={{ fontSize: 34, color: '#FFFFFF' }} />
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Join the Complaint Management Platform
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
            <Stack spacing={2.2}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#818CF8' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#818CF8' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
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
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#818CF8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="AGENT">Agent</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </TextField>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<HowToReg />}
                fullWidth
                sx={{
                  py: 1.6,
                  mt: 1,
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Already have an account?{' '}
              <Typography
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: '#818CF8',
                  textDecoration: 'none',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#A78BFA', textDecoration: 'underline' },
                }}
              >
                Sign In
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
