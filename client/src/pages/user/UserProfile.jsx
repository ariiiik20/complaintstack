import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Person,
  Lock,
  Save,
  Shield,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || user?.contactNumber || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateUserProfile(profileData);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    try {
      await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return { bg: 'rgba(244,63,94,0.18)', text: '#FB7185', border: 'rgba(244,63,94,0.3)' };
      case 'AGENT':
        return { bg: 'rgba(56,189,248,0.18)', text: '#38BDF8', border: 'rgba(56,189,248,0.3)' };
      default:
        return { bg: 'rgba(99,102,241,0.18)', text: '#818CF8', border: 'rgba(99,102,241,0.3)' };
    }
  };

  const roleStyle = getRoleColor(user?.role);

  return (
    <Box className="animate-fadeIn" sx={{ maxWidth: 900, mx: 'auto', py: 2 }}>
      {/* Header Banner */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                fontSize: '2.2rem',
                fontWeight: 800,
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#F8FAFC' }}>
                  {user?.name}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{
                    bgcolor: roleStyle.bg,
                    color: roleStyle.text,
                    border: `1px solid ${roleStyle.border}`,
                    fontWeight: 800,
                    borderRadius: '8px',
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {user?.email} • {user?.department || 'General'}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#94A3B8',
              '&.Mui-selected': { color: '#818CF8' },
            },
          }}
        >
          <Tab icon={<Person sx={{ fontSize: 18 }} />} iconPosition="start" label="General Information" />
          <Tab icon={<Lock sx={{ fontSize: 18 }} />} iconPosition="start" label="Security & Password" />
        </Tabs>
      </Card>

      {/* Tab 1: General Info */}
      {tabValue === 0 && (
        <Card
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3, color: '#F8FAFC' }}>
              Personal Details
            </Typography>

            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    fullWidth
                    helperText="Email address cannot be changed"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Department"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="e.g. IT, Maintenance, Computer Eng."
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Contact Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="e.g. 9876543210"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3.5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={profileSaving}
                  startIcon={<Save />}
                  sx={{ py: 1.3, px: 4, borderRadius: '12px', fontWeight: 700 }}
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Security & Password */}
      {tabValue === 1 && (
        <Card
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 1, color: '#F8FAFC' }}>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ensure your account is using a strong password.
            </Typography>

            {passwordError && (
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
                {passwordError}
              </Alert>
            )}

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Stack spacing={2.5} sx={{ maxWidth: 500 }}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />

                <TextField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                  helperText="Minimum 6 characters"
                />

                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />

                <Box sx={{ pt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={passwordSaving}
                    startIcon={<Shield />}
                    sx={{ py: 1.3, px: 4, borderRadius: '12px', fontWeight: 700 }}
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserProfile;
