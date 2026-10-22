import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  AddCircle,
  ListAlt,
  Assignment,
  Analytics,
  People,
  Feedback,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    USER: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'New Complaint', icon: <AddCircle />, path: '/dashboard/new' },
      { text: 'My Complaints', icon: <ListAlt />, path: '/dashboard/complaints' },
    ],
    AGENT: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/agent' },
      { text: 'Assigned Tickets', icon: <Assignment />, path: '/agent/assigned' },
    ],
    ADMIN: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
      { text: 'All Complaints', icon: <ListAlt />, path: '/admin/complaints' },
      { text: 'Agents', icon: <People />, path: '/admin/agents' },
      { text: 'Analytics', icon: <Analytics />, path: '/admin/analytics' },
      { text: 'Feedback', icon: <Feedback />, path: '/admin/feedback' },
    ],
  };

  const items = menuItems[user?.role] || [];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography
          variant="overline"
          sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.12em', fontSize: '0.7rem' }}
        >
          MAIN MENU
        </Typography>
      </Box>
      <List sx={{ px: 2, flexGrow: 1 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  onMobileClose?.();
                }}
                sx={{
                  borderRadius: '14px',
                  py: 1.4,
                  px: 2,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.15) 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(129, 140, 248, 0.35)' : '1px solid transparent',
                  boxShadow: isActive
                    ? '0 4px 20px rgba(99, 102, 241, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                    : 'none',
                  color: isActive ? '#F8FAFC' : '#94A3B8',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.22) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#818CF8' : '#64748B',
                    minWidth: 38,
                    fontSize: 22,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 5,
                      height: 22,
                      borderRadius: 3,
                      bgcolor: '#6366F1',
                      boxShadow: '0 0 12px #6366F1',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
          ComplaintDesk Suite
        </Typography>
        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
          Glassmorphism Edition v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          width: DRAWER_WIDTH,
          flexShrink: 0,
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
