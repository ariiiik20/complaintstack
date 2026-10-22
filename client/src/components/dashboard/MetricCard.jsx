import { Card, CardContent, Typography, Box } from '@mui/material';

const MetricCard = ({ title, value, icon, color = '#6366F1', subtitle, trend }) => {
  return (
    <Card
      className="glass-card-interactive"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 12px ${color}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.72rem' }}
            >
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#F8FAFC', mt: 0.5, letterSpacing: '-0.02em' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  color: trend > 0 ? '#34D399' : '#FB7185',
                  fontWeight: 700,
                  display: 'block',
                  mt: 0.5,
                }}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)`,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 20px ${color}25`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
