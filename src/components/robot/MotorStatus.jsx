// =================== MotorStatus.jsx ===================
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Memory,
  Thermostat,
  ElectricBolt,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Settings,
  Refresh,
  Info
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useRobot } from '../../hooks/useRobot';
import { formatNumber, radToDeg } from '../../utils/helpers';
import { StatusIndicator } from '../common';

const MotorCard = ({ motorId, actuator, onToggleTorque, onCalibrateMotor }) => {
  const [expanded, setExpanded] = useState(false);

  if (!actuator) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Motor {motorId}
          </Typography>
          <Alert severity="warning">Motor not detected</Alert>
        </CardContent>
      </Card>
    );
  }

  const temperature = actuator.present_temperature || 0;
  const voltage = actuator.present_voltage || 0;
  const current = Math.abs(actuator.present_current || 0);
  const position = radToDeg(actuator.present_position || 0);
  const velocity = Math.abs(radToDeg(actuator.present_velocity || 0));
  const torqueEnabled = actuator.torque_enabled || false;
  const moving = actuator.moving || false;
  const hardwareError = actuator.hardware_error || 0;

  // Status determination
  const getMotorStatus = () => {
    if (hardwareError > 0) return 'error';
    if (temperature > 70) return 'overheating';
    if (temperature > 60) return 'warning';
    if (!torqueEnabled) return 'disabled';
    if (moving) return 'moving';
    return 'normal';
  };

  const motorStatus = getMotorStatus();
  
  const getStatusColor = () => {
    switch (motorStatus) {
      case 'error': return 'error';
      case 'overheating': return 'error';
      case 'warning': return 'warning';
      case 'disabled': return 'default';
      case 'moving': return 'info';
      default: return 'success';
    }
  };

  const getStatusText = () => {
    switch (motorStatus) {
      case 'error': return 'ERROR';
      case 'overheating': return 'OVERHEATING';
      case 'warning': return 'HIGH TEMP';
      case 'disabled': return 'DISABLED';
      case 'moving': return 'MOVING';
      default: return 'NORMAL';
    }
  };

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Motor {motorId}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusIndicator
              status={motorStatus}
              variant="chip"
              size="small"
              label={getStatusText()}
            />
            
            <Tooltip title="Motor Settings">
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error Alert */}
        {hardwareError > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Hardware Error Code: {hardwareError}
          </Alert>
        )}

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Temperature */}
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Thermostat 
                color={temperature > 60 ? 'error' : temperature > 50 ? 'warning' : 'success'} 
                sx={{ mb: 0.5 }}
              />
              <Typography variant="h6" color={temperature > 60 ? 'error' : 'inherit'}>
                {temperature.toFixed(1)}°C
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Temperature
              </Typography>
            </Box>
          </Grid>

          {/* Position */}
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Memory color="primary" sx={{ mb: 0.5 }} />
              <Typography variant="h6">
                {formatNumber(position)}°
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Position
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Status Bars */}
        <Box sx={{ mb: 2 }}>
          {/* Temperature Bar */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Temperature</Typography>
              <Typography variant="caption">{temperature.toFixed(1)}°C</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (temperature / 80) * 100)}
              color={temperature > 60 ? 'error' : temperature > 50 ? 'warning' : 'success'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Voltage Bar */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Voltage</Typography>
              <Typography variant="caption">{voltage.toFixed(1)}V</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (voltage / 14) * 100)}
              color="info"
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Current Bar */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Current</Typography>
              <Typography variant="caption">{current.toFixed(0)}mA</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (current / 1000) * 100)}
              color={current > 800 ? 'warning' : 'primary'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch
                checked={torqueEnabled}
                onChange={() => onToggleTorque(motorId)}
                size="small"
              />
            }
            label="Torque"
            sx={{ mr: 0 }}
          />
          
          {expanded && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onCalibrateMotor(motorId)}
            >
              Calibrate
            </Button>
          )}
        </Box>

        {/* Expanded Details */}
        {expanded && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Status
            </Typography>
            
            <Grid container spacing={1} sx={{ fontSize: '0.75rem' }}>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Velocity: {formatNumber(velocity)}°/s
                </Typography>
                <Typography variant="caption" display="block">
                  Goal Position: {formatNumber(radToDeg(actuator.goal_position || 0))}°
                </Typography>
                <Typography variant="caption" display="block">
                  Moving: {moving ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Current: {current.toFixed(0)}mA
                </Typography>
                <Typography variant="caption" display="block">
                  Voltage: {voltage.toFixed(1)}V
                </Typography>
                <Typography variant="caption" display="block">
                  Error: {hardwareError}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const MotorStatus = ({ compact = false }) => {
  const { connected, enableTorque, disableTorque, sendCommand } = useRobot();
  const { actuators } = useSelector(state => state.robot);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000);

  // Auto-refresh motor status
  useEffect(() => {
    if (autoRefresh && connected) {
      const interval = setInterval(() => {
        sendCommand('get_motor_status');
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, connected, refreshInterval, sendCommand]);

  const handleToggleTorque = async (motorId) => {
    try {
      const actuator = actuators[motorId];
      if (actuator) {
        if (actuator.torque_enabled) {
          await disableTorque(motorId);
        } else {
          await enableTorque(motorId);
        }
      }
    } catch (error) {
      console.error(`Failed to toggle torque for motor ${motorId}:`, error);
    }
  };

  const handleCalibrateMotor = async (motorId) => {
    try {
      await sendCommand('calibrate_motor', { motor_id: motorId });
    } catch (error) {
      console.error(`Failed to calibrate motor ${motorId}:`, error);
    }
  };

  const handleRefreshAll = () => {
    if (connected) {
      sendCommand('get_motor_status');
    }
  };

  const getSystemStatus = () => {
    if (!actuators || Object.keys(actuators).length === 0) {
      return { status: 'disconnected', issues: [] };
    }

    const issues = [];
    let worstStatus = 'normal';

    Object.entries(actuators).forEach(([id, actuator]) => {
      const temp = actuator.present_temperature || 0;
      const error = actuator.hardware_error || 0;

      if (error > 0) {
        issues.push(`Motor ${id}: Hardware error ${error}`);
        worstStatus = 'error';
      } else if (temp > 70) {
        issues.push(`Motor ${id}: Overheating (${temp.toFixed(1)}°C)`);
        if (worstStatus !== 'error') worstStatus = 'overheating';
      } else if (temp > 60) {
        issues.push(`Motor ${id}: High temperature (${temp.toFixed(1)}°C)`);
        if (worstStatus === 'normal') worstStatus = 'warning';
      }
    });

    return { status: worstStatus, issues };
  };

  const systemStatus = getSystemStatus();

  if (compact) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Motors ({Object.keys(actuators || {}).length})
          </Typography>
          <StatusIndicator
            status={systemStatus.status}
            variant="chip"
            size="small"
          />
        </Box>
        
        {systemStatus.issues.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {systemStatus.issues.slice(0, 2).map((issue, index) => (
              <Typography key={index} variant="caption" color="error" display="block">
                {issue}
              </Typography>
            ))}
            {systemStatus.issues.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{systemStatus.issues.length - 2} more issues
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Memory color="primary" />
          Motor Status Monitor
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
          />
          
          <Tooltip title="Refresh Now">
            <IconButton onClick={handleRefreshAll} disabled={!connected}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Status Alert */}
      {systemStatus.issues.length > 0 && (
        <Alert 
          severity={systemStatus.status === 'error' ? 'error' : 'warning'} 
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            System Issues Detected:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {systemStatus.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Connection Status */}
      {!connected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Robot not connected. Motor status unavailable.
        </Alert>
      )}

      {/* Motor Cards Grid */}
      <Grid container spacing={3}>
        {[1, 2, 3].map((motorId) => (
          <Grid item xs={12} md={4} key={motorId}>
            <MotorCard
              motorId={motorId}
              actuator={actuators?.[motorId]}
              onToggleTorque={handleToggleTorque}
              onCalibrateMotor={handleCalibrateMotor}
            />
          </Grid>
        ))}
      </Grid>

      {/* Summary Statistics */}
      {connected && actuators && Object.keys(actuators).length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            System Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Motors Online:
              </Typography>
              <Typography variant="h6">
                {Object.keys(actuators).length}/3
              </Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Torque Enabled:
              </Typography>
              <Typography variant="h6">
                {Object.values(actuators).filter(a => a.torque_enabled).length}
              </Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Avg Temperature:
              </Typography>
              <Typography variant="h6">
                {Object.values(actuators).length > 0 
                  ? (Object.values(actuators).reduce((sum, a) => sum + (a.present_temperature || 0), 0) / Object.values(actuators).length).toFixed(1)
                  : 0
                }°C
              </Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Total Current:
              </Typography>
              <Typography variant="h6">
                {Object.values(actuators).reduce((sum, a) => sum + Math.abs(a.present_current || 0), 0).toFixed(0)}mA
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default MotorStatus;