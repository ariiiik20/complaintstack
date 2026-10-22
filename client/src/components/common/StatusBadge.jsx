import { Chip } from '@mui/material';

const StatusBadge = ({ status, size = 'small', ...props }) => {
  const getBadgeStyle = (st) => {
    switch (st) {
      case 'Resolved':
        return {
          bgcolor: 'rgba(16, 185, 129, 0.16)',
          color: '#34D399',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)',
        };
      case 'In Progress':
        return {
          bgcolor: 'rgba(245, 158, 11, 0.16)',
          color: '#FBBF24',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
        };
      case 'Pending':
        return {
          bgcolor: 'rgba(244, 63, 94, 0.16)',
          color: '#FB7185',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          boxShadow: '0 0 12px rgba(244, 63, 94, 0.2)',
        };
      case 'Closed':
        return {
          bgcolor: 'rgba(100, 116, 139, 0.2)',
          color: '#94A3B8',
          border: '1px solid rgba(100, 116, 139, 0.35)',
        };
      default:
        return {
          bgcolor: 'rgba(99, 102, 241, 0.16)',
          color: '#818CF8',
          border: '1px solid rgba(99, 102, 241, 0.35)',
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? '0.72rem' : '0.82rem',
        letterSpacing: '0.04em',
        borderRadius: '10px',
        backdropFilter: 'blur(8px)',
        px: 0.5,
        py: 0.2,
        ...style,
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
