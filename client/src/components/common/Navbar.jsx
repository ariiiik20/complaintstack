import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  Popover,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Logout,
  Dashboard,
  BugReport,
  Notifications,
  ChatBubble,
  Update,
} from '@mui/icons-material';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // User menu anchor
  const [anchorEl, setAnchorEl] = useState(null);

  // Notification menu anchor & items
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [isAuthenticated]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif) => {
    handleNotifClose();
    setUnreadCount((prev) => Math.max(0, prev - 1));
    const rolePrefix = user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/dashboard';
    if (notif.ticketId) {
      navigate(`${rolePrefix}/complaint/${notif.ticketId}`);
    }
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const map = { USER: '#10B981', AGENT: '#38BDF8', ADMIN: '#F43F5E' };
    return map[role] || '#94A3B8';
  };

  const getDashboardPath = () => {
    const map = { USER: '/dashboard', AGENT: '/agent', ADMIN: '/admin' };
    return map[user?.role] || '/dashboard';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(7, 10, 20, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      }}
    >
      <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          onClick={() => navigate(isAuthenticated ? getDashboardPath() : '/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            mr: 2,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <BugReport sx={{ color: '#FFFFFF', fontSize: 24 }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: '1.25rem',
            }}
          >
            ComplaintDesk
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                bgcolor: `${getRoleColor(user?.role)}1A`,
                color: getRoleColor(user?.role),
                border: `1px solid ${getRoleColor(user?.role)}40`,
                boxShadow: `0 0 12px ${getRoleColor(user?.role)}20`,
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                display: { xs: 'none', sm: 'flex' },
              }}
            />

            {/* Notification Bell */}
            <IconButton
              onClick={handleNotifOpen}
              sx={{
                color: '#94A3B8',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#F8FAFC',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  borderColor: 'rgba(129, 140, 248, 0.4)',
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Notifications Popover */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  width: 360,
                  maxHeight: 450,
                  bgcolor: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  mt: 1.5,
                  overflow: 'hidden',
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                  🔔 Real-Time Alerts ({notifications.length})
                </Typography>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllRead}
                    sx={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 600 }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>

              <Box sx={{ overflowY: 'auto', maxHeight: 350 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No new live alerts
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif, idx) => (
                    <MenuItem
                      key={idx}
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        p: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        whiteSpace: 'normal',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        {notif.type === 'MESSAGE' ? (
                          <ChatBubble sx={{ color: '#38BDF8', fontSize: 20 }} />
                        ) : (
                          <Update sx={{ color: '#10B981', fontSize: 20 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block' }}>
                            {notif.type === 'MESSAGE'
                              ? `New message from ${notif.senderName}`
                              : `Ticket status updated to ${notif.status}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                            {notif.text || `Click to inspect ticket details`}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  ))
                )}
              </Box>
            </Popover>

            {/* User Profile Avatar Button */}
            <IconButton onClick={handleMenu} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  bgcolor: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  p: 0.5,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <MenuItem
                onClick={() => {
                  navigate(getDashboardPath());
                  handleClose();
                }}
                sx={{ borderRadius: '10px', mx: 0.5, my: 0.3 }}
              >
                <ListItemIcon>
                  <Dashboard fontSize="small" sx={{ color: '#818CF8' }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Dashboard</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const map = { USER: '/dashboard/profile', AGENT: '/agent/profile', ADMIN: '/admin/profile' };
                  navigate(map[user?.role] || '/dashboard/profile');
                  handleClose();
                }}
                sx={{ borderRadius: '10px', mx: 0.5, my: 0.3 }}
              >
                <ListItemIcon>
                  <Person fontSize="small" sx={{ color: '#38BDF8' }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Profile & Settings</ListItemText>
              </MenuItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <MenuItem onClick={handleLogout} sx={{ borderRadius: '10px', mx: 0.5, my: 0.3 }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: '#F43F5E' }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ color: '#F43F5E', fontWeight: 600 }}>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant={location.pathname === '/login' ? 'contained' : 'outlined'}
              onClick={() => navigate('/login')}
              size="small"
              sx={{ px: 3, py: 1 }}
            >
              Login
            </Button>
            <Button
              variant={location.pathname === '/register' ? 'contained' : 'outlined'}
              onClick={() => navigate('/register')}
              size="small"
              sx={{ px: 3, py: 1 }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
