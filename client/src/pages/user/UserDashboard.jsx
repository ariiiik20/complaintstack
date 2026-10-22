import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import {
  Box,
  Typography,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  PendingActions,
  Loop,
  CheckCircle,
  ListAlt,
} from '@mui/icons-material';
import MetricCard from '../../components/dashboard/MetricCard';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserDashboard = () => {
  const { complaints, pagination, loading, getMyComplaints } = useComplaints();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== '/dashboard';

  useEffect(() => {
    if (!isSubRoute) {
      getMyComplaints({ status: statusFilter || undefined, category: categoryFilter || undefined, page });
    }
  }, [statusFilter, categoryFilter, page, isSubRoute, getMyComplaints]);

  if (isSubRoute) {
    return <Outlet />;
  }

  // Multi-filter client-side search & filtering
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate metrics
  const metrics = {
    total: complaints.length > 0 ? pagination.total : 0,
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
        My Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Track, manage, and submit your complaints in real time
      </Typography>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Total Complaints"
            value={metrics.total}
            icon={<ListAlt sx={{ fontSize: 28 }} />}
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

      <Grid container spacing={4}>
        {/* Quick Submit Form */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <ComplaintForm
            onSuccess={() => getMyComplaints({ status: statusFilter || undefined, page: 1 })}
          />
        </Grid>

        {/* Complaints List */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
              📋 My Complaints
            </Typography>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search complaints..."
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
                sx={{ minWidth: 120 }}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Billing">Billing</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Facility">Facility</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </TextField>

              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 120 }}
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
            <LoadingSpinner message="Loading complaints..." />
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
              <Typography variant="h1" sx={{ fontSize: '3.5rem', mb: 2 }}>📭</Typography>
              <Typography variant="h6" color="text.primary" fontWeight={700}>
                No matching complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or filters
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredComplaints.map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} basePath="/dashboard" />
              ))}

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
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
