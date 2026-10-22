import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import {
  PendingActions,
  Loop,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';

const statusConfig = {
  Pending: { icon: <PendingActions fontSize="small" /> },
  'In Progress': { icon: <Loop fontSize="small" /> },
  Resolved: { icon: <CheckCircle fontSize="small" /> },
  Rejected: { icon: <Cancel fontSize="small" /> },
};

const ComplaintTimeline = ({ auditTrail = [] }) => {
  if (!auditTrail.length) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
        No timeline entries yet.
      </Typography>
    );
  }

  return (
    <Timeline sx={{ p: 0, m: 0 }}>
      {auditTrail.map((entry, index) => {
        const config = statusConfig[entry.status] || statusConfig.Pending;
        const isLast = index === auditTrail.length - 1;

        return (
          <TimelineItem key={entry._id || index}>
            <TimelineOppositeContent
              sx={{ flex: 0.35, py: 1.5, px: 1 }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {formatDate(entry.timestamp)}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
                  color: '#818CF8',
                  p: 0.8,
                }}
              >
                {config.icon}
              </TimelineDot>
              {!isLast && <TimelineConnector sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <StatusBadge status={entry.status} />
                {entry.remark && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: '#F8FAFC' }}>
                    {entry.remark}
                  </Typography>
                )}
                {entry.updatedBy && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: 'block' }}>
                    by <strong style={{ color: '#818CF8' }}>{typeof entry.updatedBy === 'object' ? entry.updatedBy.name : 'System'}</strong>
                  </Typography>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ComplaintTimeline;
