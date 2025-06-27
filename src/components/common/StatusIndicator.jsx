// =================== StatusIndicator.jsx ===================
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { 
  Circle, 
  CheckCircle, 
  Error, 
  Warning, 
  Wifi, 
  WifiOff,
  Bluetooth,
  BluetoothDisabled
} from '@mui/icons-material';

const StatusIndicator = ({ 
  status, 
  label, 
  type = 'connection', // 'connection', 'robot', 'challenge', 'custom'
  size = 'medium',
  showLabel = true,
  variant = 'chip' // 'chip', 'icon', 'dot'
}) => {
  const getStatusConfig = () => {
    if (type === 'connection') {
      switch (status) {
        case 'connected':
          return { 
            color: 'success', 
            icon: <Wifi />, 
            text: 'Connected',
            chipColor: 'success'
          };
        case 'disconnected':
          return { 
            color: 'error', 
            icon: <WifiOff />, 
            text: 'Disconnected',
            chipColor: 'error'
          };
        case 'connecting':
          return { 
            color: 'warning', 
            icon: <Circle />, 
            text: 'Connecting...',
            chipColor: 'warning'
          };
        default:
          return { 
            color: 'default', 
            icon: <Circle />, 
            text: 'Unknown',
            chipColor: 'default'
          };
      }
    } else if (type === 'robot') {
      switch (status) {
        case 'online':
          return { 
            color: 'success', 
            icon: <CheckCircle />, 
            text: 'Robot Online',
            chipColor: 'success'
          };
        case 'offline':
          return { 
            color: 'error', 
            icon: <Error />, 
            text: 'Robot Offline',
            chipColor: 'error'
          };
        case 'error':
          return { 
            color: 'error', 
            icon: <Warning />, 
            text: 'Robot Error',
            chipColor: 'error'
          };
        case 'moving':
          return { 
            color: 'info', 
            icon: <Circle />, 
            text: 'Robot Moving',
            chipColor: 'info'
          };
        default:
          return { 
            color: 'default', 
            icon: <Circle />, 
            text: 'Unknown',
            chipColor: 'default'
          };
      }
    } else if (type === 'challenge') {
      switch (status) {
        case 'completed':
          return { 
            color: 'success', 
            icon: <CheckCircle />, 
            text: 'Completed',
            chipColor: 'success'
          };
        case 'in-progress':
          return { 
            color: 'info', 
            icon: <Circle />, 
            text: 'In Progress',
            chipColor: 'info'
          };
        case 'failed':
          return { 
            color: 'error', 
            icon: <Error />, 
            text: 'Failed',
            chipColor: 'error'
          };
        case 'locked':
          return { 
            color: 'default', 
            icon: <Circle />, 
            text: 'Locked',
            chipColor: 'default'
          };
        default:
          return { 
            color: 'default', 
            icon: <Circle />, 
            text: 'Not Started',
            chipColor: 'default'
          };
      }
    }
    
    // Custom status
    return { 
      color: 'default', 
      icon: <Circle />, 
      text: label || status,
      chipColor: 'default'
    };
  };

  const config = getStatusConfig();
  const displayText = label || config.text;

  if (variant === 'chip') {
    return (
      <Chip
        icon={config.icon}
        label={displayText}
        color={config.chipColor}
        size={size}
        variant="outlined"
      />
    );
  }

  if (variant === 'icon') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: `${config.color}.main` }}>
          {config.icon}
        </Box>
        {showLabel && (
          <Typography variant="body2" color={`${config.color}.main`}>
            {displayText}
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'dot') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: size === 'small' ? 8 : 12,
            height: size === 'small' ? 8 : 12,
            borderRadius: '50%',
            backgroundColor: `${config.color}.main`
          }}
        />
        {showLabel && (
          <Typography variant="body2">
            {displayText}
          </Typography>
        )}
      </Box>
    );
  }

  return null;
};

export default StatusIndicator;
