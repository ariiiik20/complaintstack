import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { Email, ArrowBack, LockReset } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
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
              <LockReset sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Box>

            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#F8FAFC' }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Enter your registered email address to receive a secure password reset link.
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

          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                }}
              >
                Check your inbox! We've sent a password reset link to <strong>{email}</strong>.
              </Alert>
              <Button
                variant="outlined"
                onClick={() => setSubmitted(false)}
                sx={{ borderRadius: '12px' }}
              >
                Try another email address
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="name@company.com"
                  InputProps={{
                    startAdornment: <Email sx={{ color: '#818CF8', mr: 1 }} />,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !email}
                  sx={{
                    py: 1.5,
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </Button>
              </Stack>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3.5 }}>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#818CF8',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowBack sx={{ fontSize: 16 }} /> Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
