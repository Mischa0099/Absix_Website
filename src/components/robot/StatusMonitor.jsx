import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Bluetooth, 
  BatteryAlert, 
  Thermostat, 
  Speed,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatNumber } from '../../utils/helpers';

const StatusMonitor = () => {
  const { 
    connected, 
    status, 
    jointAngles, 
    jointVelocities, 
    hardware, 
    error 
  } = useSelector(state => state.robot);
  
  const { subscribeToRobotUpdates } = useWebSocket();
  const [realtimeData, setRealtimeData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToRobotUpdates((data) => {
      setRealtimeData(data);
      checkAlerts(data);
    });

    return unsubscribe;
  }, [subscribeToRobotUpdates]);

  const checkAlerts = (data) => {
    const newAlerts = [];

    // Temperature alerts
    if (data.hardware?.temperature) {
      data.hardware.temperature.forEach((temp, index) => {
        if (temp > 65) {
          newAlerts.push({
            id: `temp-${index}`,
            severity: 'error',
            message: `Joint ${index + 1} temperature critical: ${temp}°C`
          });
        } else if (temp > 55) {
          newAlerts.push({
            id: `temp-${index}`,
            severity: 'warning',
            message: `Joint ${index + 1} temperature high: ${temp}°C`
          });
        }
      });
    }

    // Voltage alerts
    if (data.hardware?.voltage) {
      data.hardware.voltage.forEach((voltage, index) => {
        if (voltage < 5.5) {
          newAlerts.push({
            id: `voltage-${index}`,
            severity: 'warning',
            message: `Joint ${index + 1} voltage low: ${voltage}V`
          });
        }
      });
    }

    // Velocity alerts (too fast)
    if (data.jointVelocities) {
      data.jointVelocities.forEach((velocity, index) => {
        if (Math.abs(velocity) > 5.0) { // > 5 rad/s
          newAlerts.push({
            id: `velocity-${index}`,
            severity: 'warning',
            message: `Joint ${index + 1} moving fast: ${formatNumber(velocity * 180 / Math.PI)}°/s`
          });
        }
      });
    }

    setAlerts(newAlerts);
  };

  const getConnectionStatusColor = () => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle />;
      case 'connecting': return <Bluetooth />;
      case 'error': return <ErrorIcon />;
      default: return <Bluetooth />;
    }
  };

  return (
    <Box>
      {/* Connection Status */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Robot Status Monitor
          </Typography>
          <Chip
            icon={getConnectionStatusIcon()}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={getConnectionStatusColor()}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              severity={alert.severity} 
              sx={{ mb: 1 }}
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Main Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Joint Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Joint Status
            </Typography>
            
            {jointAngles.map((angle, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Joint {index + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(angle * 180 / Math.PI)}°
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={Math.abs(angle) / Math.PI * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: Math.abs(angle) > 2.5 ? '#f44336' : '#4caf50'
                    }
                  }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  Velocity: {formatNumber(jointVelocities[index] * 180 / Math.PI)}°/s
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Hardware Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Hardware Status
            </Typography>
            
            <List dense>
              {/* Temperature Status */}
              {hardware.temperature.map((temp, index) => (
                <ListItem key={`temp-${index}`}>
                  <ListItemIcon>
                    <Thermostat 
                      color={temp > 60 ? 'error' : temp > 50 ? 'warning' : 'success'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Motor ${index + 1} Temperature`}
                    secondary={`${formatNumber(temp)}°C`}
                  />
                </ListItem>
              ))}

              {/* Voltage Status */}
              {hardware.voltage.map((voltage, index) => (
                <ListItem key={`voltage-${index}`}>
                  <ListItemIcon>
                    <BatteryAlert 
                      color={voltage < 6.0 ? 'warning' : 'success'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Motor ${index + 1} Voltage`}
                    secondary={`${formatNumber(voltage)}V`}
                  />
                </ListItem>
              ))}

              {/* Current Status */}
              {hardware.current.map((current, index) => (
                <ListItem key={`current-${index}`}>
                  <ListItemIcon>
                    <Speed 
                      color={Math.abs(current) > 1000 ? 'warning' : 'primary'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Motor ${index + 1} Current`}
                    secondary={`${formatNumber(current)}mA`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Connection Status
                </Typography>
                <Typography variant="body1">
                  {connected ? 'Connected' : 'Disconnected'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Communication
                </Typography>
                <Typography variant="body1">
                  {realtimeData ? 'Real-time' : 'Polling'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Last Update
                </Typography>
                <Typography variant="body1">
                  {realtimeData ? new Date().toLocaleTimeString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Active Alerts
                </Typography>
                <Typography variant="body1" color={alerts.length > 0 ? 'error' : 'success'}>
                  {alerts.length}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusMonitor;