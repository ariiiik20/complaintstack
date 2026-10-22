import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import {
  AccessTime,
  Person,
  FlagCircle,
} from '@mui/icons-material';
import StatusBadge from '../common/StatusBadge';
import { formatRelativeTime, getCategoryIcon, getPriorityColor, truncateText } from '../../utils/helpers';

const ComplaintCard = ({ complaint, basePath = '/dashboard' }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="glass-card-interactive"
      sx={{
        cursor: 'pointer',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.01)',
          borderColor: 'rgba(129, 140, 248, 0.4)',
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`${basePath}/complaint/${complaint._id}`)}
        sx={{ p: 0 }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ flex: 1, mr: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3, color: '#F8FAFC' }}>
                {truncateText(complaint.title, 60)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {truncateText(complaint.description, 100)}
              </Typography>
            </Box>
            <StatusBadge status={complaint.status} />
          </Box>

          {/* Meta row */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mt: 2.5 }}>
            <Chip
              label={`${getCategoryIcon(complaint.category)} ${complaint.category}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                color: '#F8FAFC',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            />
            <Chip
              icon={<FlagCircle sx={{ color: `${getPriorityColor(complaint.priority)} !important`, fontSize: 16 }} />}
              label={complaint.priority}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                color: '#F8FAFC',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <AccessTime sx={{ fontSize: 15, color: '#818CF8' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {formatRelativeTime(complaint.createdAt)}
              </Typography>
            </Box>
          </Stack>

          {/* Assigned agent */}
          {complaint.assignedAgent && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Person sx={{ fontSize: 18, color: '#38BDF8' }} />
              <Typography variant="caption" color="text.secondary">
                Assigned to: <strong style={{ color: '#F8FAFC' }}>{complaint.assignedAgent.name}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ComplaintCard;
