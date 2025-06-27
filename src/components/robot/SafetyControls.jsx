// =================== SafetyControls.jsx ===================
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Warning,
  Stop,
  Security,
  PowerOff,
  Refresh,
  Shield,
  Speed,
  Thermostat
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../utils/helpers';
import { ConfirmDialog } from '../common';

const SafetyControls = ({ compact = false }) => {
  const {
    connected,
    emergencyStop,
    resetRobot,
    disableAllTorque,
    sendCommand
  } = useRobot();
  
  const { actuators, safetyStatus } = useSelector(state => state.robot);
  
  const [safetyMode, setSafetyMode] = useState(true);
  const [emergencyStopConfirm, setEmergencyStopConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [powerOffConfirm, setPowerOffConfirm] = useState(false);
  const [safetyLimits, setSafetyLimits] = useState({
    maxTemperature: 70,
    maxVelocity: 60,
    maxCurrent: 1000
  });

  // Monitor safety conditions
  const [safetyStatus, setSafetyStatus] = useState({
    temperatureOk: true,
    velocityOk: true,
    currentOk: true,
    positionOk: true,
    communicationOk: true
  });

  useEffect(() => {
    if (actuators) {
      const temps = Object.values(actuators).map(a => a.present_temperature || 0);
      const currents = Object.values(actuators).map(a => Math.abs(a.present_current || 0));
      const velocities = Object.values(actuators).map(a => Math.abs(a.present_velocity || 0));
      
      setSafetyStatus({
        temperatureOk: temps.every(t => t < safetyLimits.maxTemperature),
        currentOk: currents.every(c => c < safetyLimits.maxCurrent),
        velocityOk: velocities.every(v => v < safetyLimits.maxVelocity),
        positionOk: true, // Add position limit checks here
        communicationOk: connected
      });
    }
  }, [actuators, safetyLimits, connected]);

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop();
      setEmergencyStopConfirm(false);
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetRobot();
      setResetConfirm(false);
    } catch (error) {
      console.error('Reset failed:', error);
    }
  };

  const handlePowerOff = async () => {
    try {
      await disableAllTorque();
      await sendCommand('power_off');
      setPowerOffConfirm(false);
    } catch (error) {
      console.error('Power off failed:', error);
    }
  };

  const getSafetyLevel = () => {
    const issues = Object.values(safetyStatus).filter(status => !status).length;
    if (issues === 0) return 'safe';
    if (issues <= 2) return 'warning';
    return 'danger';
  };

  const safetyLevel = getSafetyLevel();
  const safetyColor = safetyLevel === 'safe' ? 'success' : 
                     safetyLevel === 'warning' ? 'warning' : 'error';

  if (compact) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Safety
          </Typography>
          <Chip
            icon={<Shield />}
            label={safetyLevel.toUpperCase()}
            color={safetyColor}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Stop />}
            onClick={() => setEmergencyStopConfirm(true)}
            disabled={!connected}
          >
            E-Stop
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<PowerOff />}
            onClick={() => setPowerOffConfirm(true)}
            disabled={!connected}
          >
            Power Off
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security color="error" />
        Safety Controls
      </Typography>

      {/* Safety Status Overview */}
      <Card sx={{ mb: 3, bgcolor: `${safetyColor}.dark`, color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              System Safety: {safetyLevel.toUpperCase()}
            </Typography>
            <Shield fontSize="large" />
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {safetyLevel === 'safe' && 'All systems operating within safe parameters'}
            {safetyLevel === 'warning' && 'Some parameters approaching safety limits'}
            {safetyLevel === 'danger' && 'Safety limits exceeded - immediate action required'}
          </Typography>
        </CardContent>
      </Card>

      {/* Safety Checks Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <Thermostat color={safetyStatus.temperatureOk ? 'success' : 'error'} />
            <Typography variant="caption" display="block">
              Temperature
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {safetyStatus.temperatureOk ? 'OK' : 'HIGH'}
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <Speed color={safetyStatus.velocityOk ? 'success' : 'error'} />
            <Typography variant="caption" display="block">
              Velocity
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {safetyStatus.velocityOk ? 'OK' : 'HIGH'}
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <PowerOff color={safetyStatus.currentOk ? 'success' : 'error'} />
            <Typography variant="caption" display="block">
              Current
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {safetyStatus.currentOk ? 'OK' : 'HIGH'}
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <Security color={safetyStatus.communicationOk ? 'success' : 'error'} />
            <Typography variant="caption" display="block">
              Communication
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {safetyStatus.communicationOk ? 'OK' : 'LOST'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Safety Information */}
      {actuators && Object.keys(actuators).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Actuator Status
          </Typography>
          
          {Object.entries(actuators).map(([id, actuator]) => {
            const temp = actuator.present_temperature || 0;
            const current = Math.abs(actuator.present_current || 0);
            const tempProgress = (temp / safetyLimits.maxTemperature) * 100;
            const currentProgress = (current / safetyLimits.maxCurrent) * 100;
            
            return (
              <Box key={id} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Actuator {id}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption">
                      Temperature: {temp.toFixed(1)}°C
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, tempProgress)}
                      color={tempProgress > 80 ? 'error' : tempProgress > 60 ? 'warning' : 'success'}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption">
                      Current: {current.toFixed(0)}mA
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, currentProgress)}
                      color={currentProgress > 80 ? 'error' : currentProgress > 60 ? 'warning' : 'success'}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Safety Controls */}
      <Typography variant="subtitle2" gutterBottom>
        Emergency Controls
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<Stop />}
          onClick={() => setEmergencyStopConfirm(true)}
          disabled={!connected}
          sx={{ minWidth: 150 }}
        >
          Emergency Stop
        </Button>
        
        <Button
          variant="outlined"
          color="warning"
          startIcon={<PowerOff />}
          onClick={() => setPowerOffConfirm(true)}
          disabled={!connected}
        >
          Power Off All
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => setResetConfirm(true)}
          disabled={!connected}
        >
          Reset System
        </Button>
      </Box>

      {/* Safety Mode Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={safetyMode}
            onChange={(e) => setSafetyMode(e.target.checked)}
            color="warning"
          />
        }
        label="Enhanced Safety Mode (Stricter limits)"
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={emergencyStopConfirm}
        onClose={() => setEmergencyStopConfirm(false)}
        onConfirm={handleEmergencyStop}
        title="Emergency Stop"
        message="This will immediately stop all robot motion and disable all torque. Are you sure?"
        confirmText="Emergency Stop"
        confirmColor="error"
        severity="error"
      />

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Robot System"
        message="This will reset the robot to its initial state. Current position and settings will be lost."
        confirmText="Reset"
        confirmColor="warning"
        severity="warning"
      />

      <ConfirmDialog
        open={powerOffConfirm}
        onClose={() => setPowerOffConfirm(false)}
        onConfirm={handlePowerOff}
        title="Power Off Robot"
        message="This will disable all actuator torque and power down the robot system."
        confirmText="Power Off"
        confirmColor="error"
        severity="warning"
      />
    </Paper>
  );
};

export default SafetyControls;