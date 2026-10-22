import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  AttachFile,
  PictureAsPdf,
  OpenInNew,
  ZoomIn,
  EditNote,
  PersonAdd,
} from '@mui/icons-material';
import StatusBadge from '../../components/common/StatusBadge';
import StatusStepper from '../../components/complaints/StatusStepper';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import TicketChat from '../../components/complaints/TicketChat';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getCategoryIcon, getPriorityColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentComplaint, loading, getComplaintById, updateComplaintStatus, assignAgent } = useComplaints();
  const { user } = useAuth();
  
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Status update modal for Agent / Admin
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Agent assign modal for Admin
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    getComplaintById(id);
  }, [id, getComplaintById]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      API.get('/admin/agents')
        .then((res) => setAgents(res.data.agents || []))
        .catch(() => {});
    }
  }, [user]);

  if (loading || !currentComplaint) {
    return <LoadingSpinner message="Loading complaint details..." />;
  }

  const c = currentComplaint;
  const isOwner = c.user?._id === user?.id || c.creator?._id === user?.id;
  const canGiveFeedback = isOwner && c.status === 'Resolved' && !feedbackSubmitted;
  const roleBackPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/dashboard';

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setStatusUpdating(true);
    try {
      await updateComplaintStatus(c._id, { status: newStatus, remark });
      toast.success(`Status updated to "${newStatus}"`);
      setStatusDialogOpen(false);
      setNewStatus('');
      setRemark('');
      getComplaintById(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) return;
    setAssigning(true);
    try {
      await assignAgent(c._id, selectedAgentId);
      toast.success('Agent assigned successfully');
      setAssignDialogOpen(false);
      getComplaintById(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    } finally {
      setAssigning(false);
    }
  };

  // Process attachment URLs (handling relative /uploads/ paths)
  const getFullAttachmentUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const isPdfFile = (fileUrl) => fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <Box className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton
          onClick={() => navigate(roleBackPath)}
          sx={{
            color: '#94A3B8',
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(99,102,241,0.15)' },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em',
            }}
          >
            {c.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Ticket ID: {c._id}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <StatusBadge status={c.status} size="medium" />

          {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditNote />}
              onClick={() => {
                setNewStatus(c.status);
                setRemark('');
                setStatusDialogOpen(true);
              }}
              sx={{ borderRadius: '12px', py: 0.9 }}
            >
              Update Status
            </Button>
          )}

          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAdd />}
              onClick={() => {
                setSelectedAgentId(c.assignedAgent?._id || '');
                setAssignDialogOpen(true);
              }}
              sx={{ borderRadius: '12px', py: 0.9 }}
            >
              {c.assignedAgent ? 'Reassign Agent' : 'Assign Agent'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Progress Stepper */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em' }}>
            COMPLAINT PROGRESS
          </Typography>
          <StatusStepper status={c.status} />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              mb: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#F8FAFC' }}>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#E2E8F0' }}>
                {c.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Interactive Attachments Section */}
          <Card
            sx={{
              mb: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F8FAFC' }}>
                <AttachFile sx={{ color: '#818CF8' }} />
                Ticket Attachments ({c.attachments?.length || 0})
              </Typography>

              {!c.attachments || c.attachments.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.15)' }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No attachments uploaded for this ticket.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {c.attachments.map((att, idx) => {
                    const fullUrl = getFullAttachmentUrl(att);
                    const isPdf = isPdfFile(att);
                    const fileName = att.split('/').pop() || `Attachment_${idx + 1}`;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        {isPdf ? (
                          <Card
                            sx={{
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'space-between',
                              borderColor: 'rgba(244,63,94,0.3)',
                              bgcolor: 'rgba(244,63,94,0.06)',
                              borderRadius: '16px',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                              <PictureAsPdf sx={{ color: '#FB7185', fontSize: 32 }} />
                              <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 160, color: '#F8FAFC' }}>
                                  {fileName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  PDF Document
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<OpenInNew />}
                              onClick={() => window.open(fullUrl, '_blank', 'noopener,noreferrer')}
                              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', borderRadius: '10px' }}
                            >
                              View PDF
                            </Button>
                          </Card>
                        ) : (
                          <Card
                            sx={{
                              overflow: 'hidden',
                              borderColor: 'rgba(255,255,255,0.15)',
                              bgcolor: 'rgba(255,255,255,0.03)',
                              borderRadius: '16px',
                              '&:hover': { borderColor: 'rgba(129, 140, 248, 0.4)' },
                              transition: 'all 0.25s ease',
                            }}
                          >
                            <Box
                              sx={{
                                height: 140,
                                backgroundImage: `url(${fullUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              onClick={() => setPreviewImage(fullUrl)}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  bgcolor: 'rgba(0,0,0,0.4)',
                                  backdropFilter: 'blur(4px)',
                                  opacity: 0,
                                  '&:hover': { opacity: 1 },
                                  display: 'flex',
                                  alignItems: 'center',
                                  justify: 'center',
                                  transition: 'opacity 0.2s ease',
                                }}
                              >
                                <Chip icon={<ZoomIn />} label="Zoom Image" color="primary" size="small" />
                              </Box>
                            </Box>

                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 140, color: '#F8FAFC' }}>
                                {fileName}
                              </Typography>
                              <IconButton size="small" onClick={() => window.open(fullUrl, '_blank', 'noopener,noreferrer')} sx={{ color: '#94A3B8' }}>
                                <OpenInNew sx={{ fontSize: 16 }} />
                              </IconButton>
                            </CardContent>
                          </Card>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Ticket Messages / Direct Communication */}
          <Box sx={{ mb: 3 }}>
            <TicketChat complaintId={c._id} />
          </Box>

          {/* Audit Timeline */}
          <Card
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#F8FAFC' }}>
                🕐 Activity Timeline
              </Typography>
              <ComplaintTimeline auditTrail={c.auditTrail} />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Details Card */}
            <Card
              sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em' }} gutterBottom>
                  DETAILS
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Chip
                      label={`${getCategoryIcon(c.category)} ${c.category}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Priority</Typography>
                    <Chip
                      label={c.priority}
                      size="small"
                      sx={{
                        bgcolor: `${getPriorityColor(c.priority)}20`,
                        color: getPriorityColor(c.priority),
                        border: `1px solid ${getPriorityColor(c.priority)}40`,
                        fontWeight: 700,
                        borderRadius: '8px',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Submitted</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#F8FAFC' }}>
                      {formatDate(c.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#F8FAFC' }}>
                      {formatDate(c.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* People Card */}
            <Card
              sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em' }} gutterBottom>
                  PEOPLE
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Submitted By</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Person sx={{ fontSize: 18, color: '#818CF8' }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#F8FAFC' }}>
                        {c.user?.name || c.creator?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Assigned Agent</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Person sx={{ fontSize: 18, color: '#38BDF8' }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#F8FAFC' }}>
                        {c.assignedAgent?.name || 'Not Assigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Feedback */}
            {canGiveFeedback && (
              <FeedbackForm
                complaintId={c._id}
                onSuccess={() => setFeedbackSubmitted(true)}
              />
            )}

            {feedbackSubmitted && (
              <Card sx={{ border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.08)', borderRadius: '20px' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>✅</Typography>
                  <Typography variant="body1" fontWeight={700} color="#34D399">
                    Feedback Submitted
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thank you for your feedback!
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Lightbox Dialog for Image Zoom */}
      <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md">
        <Box sx={{ position: 'relative', bgcolor: '#000', p: 1 }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.6)', color: '#FFF' }}
          >
            ✕
          </IconButton>
          {previewImage && (
            <img
              src={previewImage}
              alt="Attachment Lightbox"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block', margin: 'auto' }}
            />
          )}
        </Box>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Update Complaint Status
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Stack spacing={2.5}>
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
              placeholder="Add status transition details..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={!newStatus || statusUpdating} sx={{ borderRadius: '12px' }}>
            {statusUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Agent Modal */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Assign / Reassign Agent
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Stack spacing={2.5}>
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
                  {agent.name} ({agent.email}) - {agent.department || 'IT'}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignAgent} disabled={!selectedAgentId || assigning} sx={{ borderRadius: '12px' }}>
            {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintDetailPage;
