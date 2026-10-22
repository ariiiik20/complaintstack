import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';

// Common
import Navbar from './components/common/Navbar';
import Sidebar, { DRAWER_WIDTH } from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import ComplaintDetailPage from './pages/user/ComplaintDetailPage';
import UserProfile from './pages/user/UserProfile';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAgents from './pages/admin/AdminAgents';
import AdminFeedback from './pages/admin/AdminFeedback';

/**
 * Layout wrapper for authenticated pages with Navbar + Sidebar.
 */
const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'transparent',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

/**
 * Root redirect based on user role.
 */
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const map = { USER: '/dashboard', AGENT: '/agent', ADMIN: '/admin' };
  return <Navigate to={map[user?.role] || '/dashboard'} replace />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="bg-ambient-container">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
      </div>
      <Router>
        <AuthProvider>
          <ComplaintProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* USER Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute roles={['USER']}>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<UserDashboard />} />
                        <Route path="new" element={<UserDashboard />} />
                        <Route path="complaints" element={<UserDashboard />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="complaint/:id" element={<ComplaintDetailPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* AGENT Routes */}
              <Route
                path="/agent/*"
                element={
                  <ProtectedRoute roles={['AGENT']}>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<AgentDashboard />} />
                        <Route path="assigned" element={<AgentDashboard />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="complaint/:id" element={<ComplaintDetailPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* ADMIN Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="complaints" element={<AdminDashboard />} />
                        <Route path="agents" element={<AdminAgents />} />
                        <Route path="analytics" element={<AdminDashboard />} />
                        <Route path="feedback" element={<AdminFeedback />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="complaint/:id" element={<ComplaintDetailPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Root redirect */}
              <Route path="/" element={<RoleRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: 12,
              }}
            />
          </ComplaintProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
