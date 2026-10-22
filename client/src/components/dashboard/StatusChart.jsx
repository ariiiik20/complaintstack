import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_COLORS = {
  Pending: '#F43F5E',
  'In Progress': '#F59E0B',
  Resolved: '#10B981',
  Rejected: '#64748B',
};

const StatusChart = ({ data = {} }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] || '#6366F1',
  }));

  if (chartData.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>Complaints by Status</Typography>
          <Typography color="text.secondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <Typography variant="h6" gutterBottom fontWeight={800} sx={{ color: '#F8FAFC' }}>
          📈 Complaints by Status
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.14)' }}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.14)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusChart;
