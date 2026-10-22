import { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
import {
  PersonAdd,
  People,
  Assignment,
  Speed,
} from '@mui/icons-material';
import MetricCard from '../../components/dashboard/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Agent modal state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'IT',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAgents = async () => {
    try {
      const { data } = await API.get('/admin/agents');
      setAgents(data.agents || []);
    } catch (err) {
      toast.error('Failed to load agent directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/admin/agents', formData);
      toast.success(`Agent "${formData.name}" created successfully!`);
      setCreateDialogOpen(false);
      setFormData({ name: '', email: '', password: '', department: 'IT', phone: '' });
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading agent directory..." />;
  }

  // Summary Metrics
  const totalAgents = agents.length;
  const totalAssigned = agents.reduce((sum, a) => sum + (a.workload?.total || 0), 0);
  const totalActive = agents.reduce((sum, a) => sum + (a.workload?.active || 0), 0);

  return (
    <Box className="animate-fadeIn">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              background: 'linear-gradient(135deg, #F8FAFC 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Agent Management & Workforce Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Manage helpdesk agents, view workload metrics, and provision verified accounts
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ py: 1.2, px: 3, borderRadius: '12px', fontWeight: 700 }}
        >
          Create New Agent
        </Button>
      </Box>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Total Active Agents"
            value={totalAgents}
            icon={<People sx={{ fontSize: 28 }} />}
            color="#38BDF8"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Total Tickets Assigned"
            value={totalAssigned}
            icon={<Assignment sx={{ fontSize: 28 }} />}
            color="#6366F1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Active In-Progress Tickets"
            value={totalActive}
            icon={<Speed sx={{ fontSize: 28 }} />}
            color="#FBBF24"
          />
        </Grid>
      </Grid>

      {/* Agent Roster Table */}
      <Card
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
              Verified Agent Directory ({agents.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Agent Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">Total Assigned</TableCell>
                  <TableCell align="center">Active Tickets</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No agents registered yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <TableRow key={agent._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
                              width: 38,
                              height: 38,
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: '#FFF',
                              boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
                            }}
                          >
                            {agent.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                            {agent.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{agent.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={agent.department || 'IT'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" color="text.secondary">{agent.phone || agent.contactNumber || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.workload?.total || 0} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.18)', color: '#818CF8', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.workload?.active || 0} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.18)', color: '#FBBF24', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{formatDate(agent.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.18)', color: '#34D399', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Agent Modal */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Create New Support Agent
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateAgent}>
          <DialogContent sx={{ pt: '24px !important' }}>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                fullWidth
                helperText="Minimum 6 characters"
              />

              <TextField
                select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="IT">IT Support</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Billing">Billing & Finance</MenuItem>
                <MenuItem value="Academic">Academic Affairs</MenuItem>
                <MenuItem value="Facility">Facility & Campus</MenuItem>
                <MenuItem value="General">General Support</MenuItem>
              </TextField>

              <TextField
                label="Contact Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g. 9876543210"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
            <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#94A3B8' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ borderRadius: '12px' }}
            >
              {submitting ? 'Creating Agent...' : 'Provision Agent Account'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminAgents;
