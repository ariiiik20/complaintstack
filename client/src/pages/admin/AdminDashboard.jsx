import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import API from '../../api/axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ConfirmationNumber,
  PendingActions,
  CheckCircle,
  Cancel,
  AccessTime,
  PictureAsPdf,
  FileDownload,
} from '@mui/icons-material';
import MetricCard from '../../components/dashboard/MetricCard';
import CategoryChart from '../../components/dashboard/CategoryChart';
import StatusChart from '../../components/dashboard/StatusChart';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { complaints, pagination, loading, getAllComplaints, assignAgent } = useComplaints();
  const [analytics, setAnalytics] = useState(null);
  const [agents, setAgents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, agentsRes] = await Promise.all([
          API.get('/admin/analytics'),
          API.get('/admin/agents'),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setAgents(agentsRes.data.agents);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    getAllComplaints({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      search: searchQuery || undefined,
      page,
    });
  }, [statusFilter, categoryFilter, searchQuery, page, getAllComplaints]);

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedAgentId) return;
    setAssigning(true);
    try {
      await assignAgent(selectedComplaint._id, selectedAgentId);
      toast.success('Agent assigned successfully');
      setAssignDialogOpen(false);
      setSelectedComplaint(null);
      setSelectedAgentId('');
      // Refresh
      getAllComplaints({ status: statusFilter || undefined, page });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    } finally {
      setAssigning(false);
    }
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportCSV = (e) => {
    if (e) e.preventDefault();
    if (!complaints || complaints.length === 0) {
      toast.info('No complaint records available to export.');
      return;
    }
    try {
      const fileName = `complaints_report_${Date.now()}.csv`;
      const success = exportToCSV(complaints, fileName, { startDate, endDate });
      if (success) {
        toast.success('CSV report generated and download started!');
      } else {
        toast.warning('No records matched the selected date filter.');
      }
    } catch (err) {
      console.error('CSV Export Error:', err);
      toast.error('Failed to generate CSV export.');
    }
  };

  const handleExportPDF = (e) => {
    if (e) e.preventDefault();
    if (!complaints || complaints.length === 0) {
      toast.info('No complaint records available to export.');
      return;
    }
    try {
      const fileName = `complaints_audit_report_${Date.now()}.pdf`;
      const success = exportToPDF(complaints, analytics || {}, { startDate, endDate, fileName });
      if (success) {
        toast.success('PDF audit report generated and download started!');
      } else {
        toast.warning('No records matched the selected date filter.');
      }
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to generate PDF audit report.');
    }
  };

  if (analyticsLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  const a = analytics || {};

  return (
    <Box className="animate-fadeIn">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
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
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            System analytics overview and complaint management
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            size="small"
            label="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140 }}
          />
          <TextField
            type="date"
            size="small"
            label="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleExportCSV}
            startIcon={<FileDownload />}
            sx={{ borderRadius: '12px', py: 1 }}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleExportPDF}
            startIcon={<PictureAsPdf />}
            sx={{ borderRadius: '12px', py: 1 }}
          >
            Export PDF Report
          </Button>
        </Stack>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <MetricCard
            title="Total Complaints"
            value={a.totalComplaints || 0}
            icon={<ConfirmationNumber sx={{ fontSize: 28 }} />}
            color="#6366F1"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <MetricCard
            title="Pending"
            value={a.statusBreakdown?.Pending || 0}
            icon={<PendingActions sx={{ fontSize: 28 }} />}
            color="#FB7185"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <MetricCard
            title="Resolved"
            value={a.statusBreakdown?.Resolved || 0}
            icon={<CheckCircle sx={{ fontSize: 28 }} />}
            color="#34D399"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <MetricCard
            title="Rejected"
            value={a.statusBreakdown?.Rejected || 0}
            icon={<Cancel sx={{ fontSize: 28 }} />}
            color="#E11D48"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Avg Resolution"
            value={`${a.avgResolutionTimeHours || 0}h`}
            icon={<AccessTime sx={{ fontSize: 28 }} />}
            color="#38BDF8"
            subtitle="hours"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryChart data={a.categoryBreakdown} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatusChart data={a.statusBreakdown} />
        </Grid>
      </Grid>

      {/* Agent Workload */}
      {a.agentWorkload && a.agentWorkload.length > 0 && (
        <Card
          sx={{
            mb: 4,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#F8FAFC' }}>
              👥 Agent Workload Overview
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell align="center">Total Assigned</TableCell>
                    <TableCell align="center">Pending</TableCell>
                    <TableCell align="center">In Progress</TableCell>
                    <TableCell align="center">Resolved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {a.agentWorkload.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#F8FAFC' }}>{agent.agentName}</Typography>
                          <Typography variant="caption" color="text.secondary">{agent.agentEmail}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.total} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(99,102,241,0.18)', color: '#818CF8' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.pending} size="small" sx={{ bgcolor: 'rgba(244,63,94,0.16)', color: '#FB7185', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.inProgress} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.16)', color: '#FBBF24', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={agent.resolved} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.16)', color: '#34D399', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* All Complaints Table */}
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
              📋 All System Complaints
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                sx={{ minWidth: 130 }}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                sx={{ minWidth: 130 }}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Facility">Facility</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </TextField>
            </Stack>
          </Box>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow
                      key={c._id}
                      hover
                      onClick={() => navigate(`/admin/complaint/${c._id}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F8FAFC' }}>
                          {c.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={c.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.priority}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            bgcolor: c.priority === 'High' || c.priority === 'Critical' ? 'rgba(244,63,94,0.18)' : c.priority === 'Medium' ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)',
                            color: c.priority === 'High' || c.priority === 'Critical' ? '#FB7185' : c.priority === 'Medium' ? '#FBBF24' : '#34D399',
                          }}
                        />
                      </TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" color="text.secondary">{c.user?.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" fontWeight={600} color={c.assignedAgent ? '#38BDF8' : 'text.disabled'}>
                          {c.assignedAgent?.name || 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(c.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/complaint/${c._id}`);
                            }}
                            sx={{ color: '#818CF8', fontSize: '0.75rem', whiteSpace: 'nowrap', fontWeight: 600 }}
                          >
                            Inspect
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(c);
                              setSelectedAgentId(c.assignedAgent?._id || '');
                              setAssignDialogOpen(true);
                            }}
                            sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', borderRadius: '10px' }}
                          >
                            {c.assignedAgent ? 'Reassign' : 'Assign'}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#94A3B8',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Assign Agent Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Assign Agent
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          {selectedComplaint && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Complaint</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                  {selectedComplaint.title}
                </Typography>
              </Box>
              <TextField
                select
                label="Select Agent"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                fullWidth
                required
              >
                {agents.map((agent) => (
                  <MenuItem key={agent._id} value={agent._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{agent.email}</Typography>
                      </Box>
                      <Chip
                        label={`${agent.workload?.active || 0} active`}
                        size="small"
                        color={agent.workload?.active > 5 ? 'error' : 'success'}
                        variant="outlined"
                        sx={{ ml: 2, borderRadius: '8px' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedAgentId || assigning}
            sx={{ borderRadius: '12px' }}
          >
            {assigning ? 'Assigning...' : 'Assign Agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
