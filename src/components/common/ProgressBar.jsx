// =================== ProgressBar.jsx ===================
import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  color = 'primary',
  height = 8,
  animated = true,
  variant = 'determinate' // 'determinate', 'indeterminate'
}) => {
  const percentage = Math.round((value / max) * 100);
  const isComplete = percentage >= 100;

  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {variant === 'determinate' ? `${percentage}%` : ''}
            </Typography>
          )}
        </Box>
      )}
      
      <LinearProgress
        variant={variant}
        value={percentage}
        color={isComplete ? 'success' : color}
        sx={{
          height: height,
          borderRadius: height / 2,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            ...(animated && {
              animation: isComplete ? 'none' : undefined
            })
          }
        }}
      />
    </Box>
  );
};

export default ProgressBar;
