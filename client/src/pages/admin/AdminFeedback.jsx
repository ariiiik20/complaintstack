import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  LinearProgress,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Star,
  RateReview,
  ThumbUp,
  Search,
} from '@mui/icons-material';
import MetricCard from '../../components/dashboard/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          API.get('/feedback/stats'),
          API.get('/feedback'),
        ]);
        setStats(statsRes.data.stats || null);
        setFeedbacks(listRes.data.feedbacks || []);
      } catch (err) {
        console.error('Failed to load feedback data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading feedback intelligence..." />;
  }

  const avgRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalFeedbacks || feedbacks.length;
  const distribution = stats?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const satisfiedCount = (distribution[4] || 0) + (distribution[5] || 0);
  const satisfactionRate = totalReviews > 0 ? Math.round((satisfiedCount / totalReviews) * 100) : 100;

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.complaint?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = !ratingFilter || f.rating === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

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
        Feedback & Rating Intelligence
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Monitor user satisfaction ratings and post-resolution service feedback
      </Typography>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Average System Rating"
            value={`${avgRating} / 5.0`}
            icon={<Star sx={{ fontSize: 28 }} />}
            color="#FBBF24"
            subtitle={`${totalReviews} verified ratings`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Total Customer Reviews"
            value={totalReviews}
            icon={<RateReview sx={{ fontSize: 28 }} />}
            color="#6366F1"
            subtitle="Submitted post-resolution"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            title="Satisfaction Index"
            value={`${satisfactionRate}%`}
            icon={<ThumbUp sx={{ fontSize: 28 }} />}
            color="#34D399"
            subtitle="4 & 5 star positive reviews"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Rating Breakdown Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
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
              <Typography variant="subtitle2" fontWeight={800} color="#94A3B8" sx={{ letterSpacing: '0.1em' }} gutterBottom>
                RATING DISTRIBUTION
              </Typography>
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Stack spacing={2}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

                  return (
                    <Box key={stars}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#F8FAFC' }}>{stars}</Typography>
                          <Star sx={{ fontSize: 16, color: '#FBBF24' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {count} ({pct}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: stars >= 4 ? '#10B981' : stars === 3 ? '#F59E0B' : '#F43F5E',
                            boxShadow: `0 0 10px ${stars >= 4 ? '#10B981' : stars === 3 ? '#F59E0B' : '#F43F5E'}`,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback List */}
        <Grid size={{ xs: 12, md: 8 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
                  User Reviews & Comments ({filteredFeedbacks.length})
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    size="small"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: '#818CF8', fontSize: 18, mr: 0.5 }} />,
                    }}
                    sx={{ minWidth: 160 }}
                  />

                  <TextField
                    select
                    size="small"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    sx={{ minWidth: 120 }}
                    label="Rating"
                  >
                    <MenuItem value="">All Stars</MenuItem>
                    <MenuItem value="5">5 Stars</MenuItem>
                    <MenuItem value="4">4 Stars</MenuItem>
                    <MenuItem value="3">3 Stars</MenuItem>
                    <MenuItem value="2">2 Stars</MenuItem>
                    <MenuItem value="1">1 Star</MenuItem>
                  </TextField>
                </Stack>
              </Box>

              {filteredFeedbacks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>💬</Typography>
                  <Typography variant="body1" color="text.secondary">
                    No matching feedback reviews found
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {filteredFeedbacks.map((f) => (
                    <Box
                      key={f._id}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                              width: 38,
                              height: 38,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                            }}
                          >
                            {f.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F8FAFC' }}>
                              {f.user?.name || 'Anonymous User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {f.user?.department ? `${f.user.department} • ` : ''}{formatDate(f.createdAt)}
                            </Typography>
                          </Box>
                        </Box>

                        <Rating value={f.rating} readOnly size="small" precision={0.5} />
                      </Box>

                      {f.comments && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '10px', color: '#E2E8F0' }}>
                          "{f.comments}"
                        </Typography>
                      )}

                      {f.complaint && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">Ticket:</Typography>
                          <Chip
                            label={f.complaint.title}
                            size="small"
                            onClick={() => navigate(`/admin/complaint/${f.complaint._id}`)}
                            clickable
                            sx={{
                              fontSize: '0.72rem',
                              bgcolor: 'rgba(99,102,241,0.12)',
                              color: '#818CF8',
                              borderColor: 'rgba(129,140,248,0.3)',
                              borderRadius: '8px',
                            }}
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminFeedback;
