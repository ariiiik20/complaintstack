import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Rating,
  Stack,
} from '@mui/material';
import { Star, Send } from '@mui/icons-material';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const FeedbackForm = ({ complaintId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await API.post('/feedback', { complaintId, rating, comments });
      toast.success('Thank you for your feedback!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Typography variant="h6" gutterBottom fontWeight={800} sx={{ color: '#F8FAFC' }}>
          ⭐ Rate Your Experience
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your feedback helps us improve our service quality.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
                icon={<Star fontSize="inherit" sx={{ color: '#FBBF24', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }} />}
                emptyIcon={<Star fontSize="inherit" sx={{ color: 'rgba(255, 255, 255, 0.15)' }} />}
                sx={{ fontSize: '2.8rem' }}
              />
              <Typography variant="caption" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor 😞'}
                {rating === 2 && 'Fair 😐'}
                {rating === 3 && 'Good 🙂'}
                {rating === 4 && 'Very Good 😄'}
                {rating === 5 && 'Excellent! 🌟'}
              </Typography>
            </Box>

            <TextField
              label="Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Share your thoughts about the resolution..."
              inputProps={{ maxLength: 1000 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading || rating === 0}
              startIcon={<Send />}
              sx={{
                py: 1.4,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                fontWeight: 700,
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.55)',
                },
              }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
