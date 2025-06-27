// =================== DashboardHeader.jsx ===================
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Refresh, 
  Settings, 
  Notifications,
  AutorenewOutlined
} from '@mui/icons-material';
import { useDashboard } from './DashboardProvider';
import { formatDistanceToNow } from 'date-fns';

const DashboardHeader = ({ title = "Dashboard", subtitle = null }) => {
  const { 
    lastRefresh, 
    autoRefresh, 
    loading, 
    refreshDashboard, 
    toggleAutoRefresh,
    liveData
  } = useDashboard();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 4,
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Left side - Title and status */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            icon={<AutorenewOutlined />}
            label={`Updated ${formatDistanceToNow(lastRefresh, { addSuffix: true })}`}
            size="small"
            variant="outlined"
          />
          
          {liveData.systemStatus && (
            <Chip
              label={`System: ${liveData.systemStatus}`}
              size="small"
              color={liveData.systemStatus === 'healthy' ? 'success' : 'warning'}
              variant="outlined"
            />
          )}
          
          {liveData.activeUsers > 0 && (
            <Chip
              label={`${liveData.activeUsers} active users`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Right side - Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
              color="primary"
            />
          }
          label="Auto-refresh"
        />
        
        <Tooltip title="Refresh dashboard">
          <IconButton 
            onClick={refreshDashboard} 
            disabled={loading}
            color="primary"
          >
            <Refresh sx={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Dashboard settings">
          <IconButton color="primary">
            <Settings />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Notifications">
          <IconButton color="primary">
            <Notifications />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default DashboardHeader;