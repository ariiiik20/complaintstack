import { Stepper, Step, StepLabel, Box } from '@mui/material';
import {
  Cancel,
} from '@mui/icons-material';

const steps = ['Pending', 'In Progress', 'Resolved'];

const getActiveStep = (status) => {
  if (status === 'Rejected') return -1;
  return steps.indexOf(status);
};

const StatusStepper = ({ status }) => {
  const activeStep = getActiveStep(status);
  const isRejected = status === 'Rejected';

  if (isRejected) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5,
          borderRadius: '16px',
          bgcolor: 'rgba(244, 63, 94, 0.14)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(244, 63, 94, 0.2)',
        }}
      >
        <Cancel sx={{ color: '#FB7185', fontSize: 24 }} />
        <Box sx={{ color: '#FB7185', fontWeight: 700, fontSize: '0.95rem' }}>Complaint Rejected</Box>
      </Box>
    );
  }

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        py: 1,
        '& .MuiStepLabel-label': {
          color: '#94A3B8',
          fontWeight: 600,
          fontSize: '0.82rem',
          mt: 1,
          '&.Mui-active': { color: '#818CF8', fontWeight: 700 },
          '&.Mui-completed': { color: '#34D399', fontWeight: 700 },
        },
        '& .MuiStepIcon-root': {
          color: 'rgba(255, 255, 255, 0.15)',
          fontSize: 28,
          '&.Mui-active': { color: '#6366F1', filter: 'drop-shadow(0 0 8px #6366F1)' },
          '&.Mui-completed': { color: '#10B981', filter: 'drop-shadow(0 0 8px #10B981)' },
        },
        '& .MuiStepConnector-line': {
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderTopWidth: 2,
        },
        '& .Mui-completed + .MuiStepConnector-root .MuiStepConnector-line': {
          borderColor: '#10B981',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
        },
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default StatusStepper;
