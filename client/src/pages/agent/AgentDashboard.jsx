import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import API from '../../api/axios';
import {
  Assignment,
  CheckCircle,
  Loop,
  PendingActions,
  Warning,
} from '@mui/icons-material';
import MetricCard from '../../components/dashboard/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { toast } from 'react-toastify';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { complaints, pagination, loading, getAssignedComplaints, updateComplaintStatus } =
    useComplaints();

  // Multi-filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Status update dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  // Escalation dialog
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    getAssignedComplaints({ status: statusFilter || undefined, category: categoryFilter || undefined, page });
  }, [statusFilter, categoryFilter, page, getAssignedComplaints]);

  const handleEscalate = async () => {
    if (!selectedComplaint || !escalationReason.trim()) return;
    setEscalating(true);
    try {
      await API.patch(`/complaints/${selectedComplaint._id}/escalate`, { reason: escalationReason });
      toast.warning('Ticket escalated to Admin for reassignment');
      setEscalateDialogOpen(false);
      setSelectedComplaint(null);
      setEscalationReason('');
      getAssignedComplaints({ status: statusFilter || undefined, page });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to escalate ticket');
    } finally {
      setEscalating(false);
    }
  };

  // Multi-filter logic
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;
    setUpdating(true);
    try {
      await updateComplaintStatus(selectedComplaint._id, { status: newStatus, remark });
      toast.success(`Status updated to "${newStatus}"`);
      setDialogOpen(false);
      setSelectedComplaint(null);
      setNewStatus('');
      setRemark('');
      getAssignedComplaints({ status: statusFilter || undefined, page });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus('');
    setRemark('');
    setDialogOpen(true);
  };

  const metrics = {
    total: pagination.total || 0,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <Box className="animate-fadeIn">
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
        Agent Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Manage and resolve your assigned complaint tickets
      </Typography>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Assigned Tickets"
            value={metrics.total}
            icon={<Assignment sx={{ fontSize: 28 }} />}
            color="#6366F1"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Pending"
            value={metrics.pending}
            icon={<PendingActions sx={{ fontSize: 28 }} />}
            color="#FB7185"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="In Progress"
            value={metrics.inProgress}
            icon={<Loop sx={{ fontSize: 28 }} />}
            color="#FBBF24"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Resolved"
            value={metrics.resolved}
            icon={<CheckCircle sx={{ fontSize: 28 }} />}
            color="#34D399"
          />
        </Grid>
      </Grid>

      {/* Multi-Filter Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
          🎫 Assigned Tickets ({filteredComplaints.length})
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 160 }}
          />

          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 130 }}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
            <MenuItem value="Billing">Billing</MenuItem>
            <MenuItem value="Academic">Academic</MenuItem>
            <MenuItem value="Facility">Facility</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 120 }}
            label="Priority"
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 130 }}
            label="Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {loading ? (
        <LoadingSpinner message="Loading tickets..." />
      ) : filteredComplaints.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '3.5rem', mb: 2 }}>🎉</Typography>
          <Typography variant="h6" color="text.primary" fontWeight={700}>
            No matching tickets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust your search or filter options above.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredComplaints.map((complaint) => (
            <Grid size={{ xs: 12, md: 6 }} key={complaint._id}>
              <Card
                className="glass-card-interactive"
                onClick={() => navigate(`/agent/complaint/${complaint._id}`)}
                sx={{
                  cursor: 'pointer',
                  border: complaint.isEscalated
                    ? '1px solid rgba(245, 158, 11, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: complaint.isEscalated
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.01)',
                    borderColor: 'rgba(129, 140, 248, 0.4)',
                    boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.25)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, mr: 1, color: '#F8FAFC' }}>
                      {complaint.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {complaint.isEscalated && (
                        <Chip icon={<Warning sx={{ fontSize: 14 }} />} label="Escalated" size="small" color="warning" />
                      )}
                      <StatusBadge status={complaint.status} />
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    {complaint.description?.substring(0, 120)}
                    {complaint.description?.length > 120 ? '...' : ''}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                    <Chip label={complaint.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <Chip
                      label={complaint.priority}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: '8px',
                        bgcolor: complaint.priority === 'High' || complaint.priority === 'Critical' ? 'rgba(244,63,94,0.18)' : complaint.priority === 'Medium' ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)',
                        color: complaint.priority === 'High' || complaint.priority === 'Critical' ? '#FB7185' : complaint.priority === 'Medium' ? '#FBBF24' : '#34D399',
                        border: `1px solid ${complaint.priority === 'High' || complaint.priority === 'Critical' ? 'rgba(244,63,94,0.3)' : complaint.priority === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="caption" color="text.secondary">
                      By: <strong style={{ color: '#F8FAFC' }}>{complaint.user?.name}</strong>
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && !complaint.isEscalated && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(complaint);
                            setEscalationReason('');
                            setEscalateDialogOpen(true);
                          }}
                          sx={{ fontSize: '0.75rem', borderRadius: '10px' }}
                        >
                          Escalate
                        </Button>
                      )}
                      {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUpdateDialog(complaint);
                          }}
                          sx={{ fontSize: '0.75rem', borderRadius: '10px' }}
                        >
                          Update Status
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Update Complaint Status
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
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
              <TextField
                label="Remark / Notes"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Add a note about this status change..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={!newStatus || updating}
            sx={{ borderRadius: '12px' }}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Escalation Dialog */}
      <Dialog open={escalateDialogOpen} onClose={() => setEscalateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          ⚠️ Request Ticket Escalation / Reassignment
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          {selectedComplaint && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Ticket to Escalate</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                  {selectedComplaint.title}
                </Typography>
              </Box>
              <TextField
                label="Reason for Escalation / Reassignment"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                multiline
                rows={3}
                required
                fullWidth
                placeholder="Explain why this ticket needs to be reassigned or escalated to Admin..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
          <Button onClick={() => setEscalateDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleEscalate}
            disabled={!escalationReason.trim() || escalating}
            sx={{ borderRadius: '12px' }}
          >
            {escalating ? 'Escalating...' : 'Submit Escalation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentDashboard;
