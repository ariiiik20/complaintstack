import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
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
import { Lock, Shield, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired reset token';
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
        justify: 'center',
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
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                mb: 2,
              }}
            >
              <Shield sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Box>

            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#F8FAFC' }}>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Enter and confirm your new password below.
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

          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert
                severity="success"
                icon={<CheckCircle fontSize="inherit" />}
                sx={{
                  mb: 3,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                }}
              >
                Password changed successfully! Redirecting to Sign In...
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: '12px' }}
              >
                Go to Sign In Now
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  fullWidth
                  helperText="Minimum 6 characters"
                  InputProps={{
                    startAdornment: <Lock sx={{ color: '#818CF8', mr: 1 }} />,
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <Lock sx={{ color: '#818CF8', mr: 1 }} />,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !password || !confirmPassword}
                  sx={{
                    py: 1.5,
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  {loading ? 'Updating Password...' : 'Reset & Save Password'}
                </Button>
              </Stack>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3.5 }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#818CF8', fontWeight: 600, fontSize: '0.88rem' }}>
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
