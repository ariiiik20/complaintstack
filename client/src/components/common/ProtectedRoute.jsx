import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute — guards routes based on authentication and optional role check.
 * @param {string[]} roles - Optional array of allowed roles
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0A0E1A 0%, #111827 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#6C63FF' }} size={48} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to user's default dashboard based on role
    const dashboardMap = {
      USER: '/dashboard',
      AGENT: '/agent',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardMap[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
