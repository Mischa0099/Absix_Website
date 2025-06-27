// =================== ControlPanel.jsx ===================
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Slider, 
  Button, 
  Grid, 
  Alert,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Home, 
  Warning,
  Settings,
  Speed,
  ExpandMore,
  Save,
  Restore,
  Lock,
  LockOpen
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { useSelector, useDispatch } from 'react-redux';
import { radToDeg, degToRad, formatNumber } from '../../utils/helpers';
import { StatusIndicator } from '../common';
import { useNotification } from '../common/Notification';

const ControlPanel = ({ 
  compact = false, 
  showAdvanced = true,
  enablePresets = true 
}) => {
  const { showNotification } = useNotification();
  const { 
    connected, 
    jointAngles, 
    targetAngles,
    jointVelocities, 
    setJointAngles, 
    setJointVelocity,
    enableTorque, 
    disableTorque, 
    emergencyStop,
    error,
    clearError,
    sendCommand
  } = useRobot();
  
  const { actuators, connectionStatus } = useSelector(state => state.robot);

  const [localAngles, setLocalAngles] = useState([0, 0, 0]);
  const [torqueEnabled, setTorqueEnabled] = useState([false, false, false]);
  const [velocityLimits, setVelocityLimits] = useState([30, 30, 30]); // degrees/second
  const [manualMode, setManualMode] = useState(false);
  const [presets, setPresets] = useState({
    home: [0, 0, 0],
    ready: [0, -45, 90],
    extended: [90, 0, 0]
  });
  const [selectedPreset, setSelectedPreset] = useState('');

  // Sync with robot state
  useEffect(() => {
    if (jointAngles.length > 0) {
      setLocalAngles(jointAngles.map(radToDeg));
    }
  }, [jointAngles]);

  // Update torque status from actuators
  useEffect(() => {
    if (actuators) {
      const torqueStates = Object.values(actuators).map(
        actuator => actuator.torque_enabled || false
      );
      setTorqueEnabled(torqueStates);
    }
  }, [actuators]);

  const handleAngleChange = (jointIndex) => (event, newValue) => {
    const newAngles = [...localAngles];
    newAngles[jointIndex] = newValue;
    setLocalAngles(newAngles);
  };

  const handleVelocityChange = (jointIndex) => (event, newValue) => {
    const newVelocities = [...velocityLimits];
    newVelocities[jointIndex] = newValue;
    setVelocityLimits(newVelocities);
  };

  const handleMoveToPosition = async () => {
    try {
      const radiansAngles = localAngles.map(degToRad);
      const success = await setJointAngles(radiansAngles);
      
      if (success) {
        showNotification('Robot moved to target position', 'success');
      } else {
        showNotification('Failed to move robot', 'error');
      }
    } catch (error) {
      showNotification(`Movement error: ${error.message}`, 'error');
    }
  };

  const handleTorqueToggle = async (jointIndex) => {
    try {
      const actuatorId = jointIndex + 1;
      const newState = !torqueEnabled[jointIndex];
      
      const success = newState 
        ? await enableTorque(actuatorId)
        : await disableTorque(actuatorId);
      
      if (success) {
        const newTorqueStates = [...torqueEnabled];
        newTorqueStates[jointIndex] = newState;
        setTorqueEnabled(newTorqueStates);
        showNotification(
          `Joint ${jointIndex + 1} torque ${newState ? 'enabled' : 'disabled'}`, 
          'success'
        );
      }
    } catch (error) {
      showNotification(`Torque control error: ${error.message}`, 'error');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop();
      setTorqueEnabled([false, false, false]);
      showNotification('Emergency stop activated', 'warning');
    } catch (error) {
      showNotification(`Emergency stop failed: ${error.message}`, 'error');
    }
  };

  const handlePresetLoad = (presetName) => {
    if (presets[presetName]) {
      setLocalAngles([...presets[presetName]]);
      setSelectedPreset(presetName);
      showNotification(`Loaded ${presetName} preset`, 'info');
    }
  };

  const handlePresetSave = (presetName) => {
    const newPresets = { ...presets };
    newPresets[presetName] = [...localAngles];
    setPresets(newPresets);
    showNotification(`Saved ${presetName} preset`, 'success');
  };

  const handleHomePosition = () => {
    setLocalAngles([0, 0, 0]);
    setSelectedPreset('home');
  };

  const jointLabels = ['Base Joint', 'Shoulder Joint', 'Elbow Joint'];
  const jointLimits = [
    { min: -180, max: 180 },
    { min: -90, max: 90 },
    { min: -90, max: 90 }
  ];

  if (!connected) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Alert severity="warning" icon={<Warning />}>
          <Typography variant="h6">Robot Not Connected</Typography>
          <Typography variant="body2">
            Please check hardware connection and ensure the communication bridge is running.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()} 
            sx={{ mt: 1 }}
          >
            Retry Connection
          </Button>
        </Alert>
      </Paper>
    );
  }

  if (compact) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Robot Control</Typography>
          <StatusIndicator 
            status={connected ? 'online' : 'offline'} 
            type="robot"
            variant="chip"
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrow />}
            onClick={handleMoveToPosition}
            disabled={!torqueEnabled.some(Boolean)}
          >
            Move
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<Home />}
            onClick={handleHomePosition}
          >
            Home
          </Button>
          
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Stop />}
            onClick={handleEmergencyStop}
          >
            Stop
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings color="primary" />
            Robot Control Panel
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusIndicator 
              status={connectionStatus} 
              type="connection"
              variant="chip"
              size="small"
            />
            <StatusIndicator 
              status={connected ? 'online' : 'offline'} 
              type="robot"
              variant="chip"
              size="small"
            />
          </Box>
        </Box>

        {/* Mode Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                color="warning"
              />
            }
            label="Manual Mode"
          />
        </Box>
      </Box>

      <Divider />

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            onClose={clearError}
            action={
              <Button color="inherit" size="small" onClick={clearError}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Controls */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Joint Controls */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              Joint Position Control
            </Typography>
            
            {localAngles.map((angle, jointIndex) => (
              <Box key={jointIndex} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {jointLabels[jointIndex]}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={`${formatNumber(angle)}°`}
                      color="primary"
                      variant="outlined"
                    />
                    
                    <Tooltip title={torqueEnabled[jointIndex] ? "Disable Torque" : "Enable Torque"}>
                      <IconButton
                        size="small"
                        onClick={() => handleTorqueToggle(jointIndex)}
                        color={torqueEnabled[jointIndex] ? "success" : "default"}
                      >
                        {torqueEnabled[jointIndex] ? <LockOpen /> : <Lock />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Slider
                  value={angle}
                  onChange={handleAngleChange(jointIndex)}
                  min={jointLimits[jointIndex].min}
                  max={jointLimits[jointIndex].max}
                  step={1}
                  marks={[
                    { value: jointLimits[jointIndex].min, label: `${jointLimits[jointIndex].min}°` },
                    { value: 0, label: '0°' },
                    { value: jointLimits[jointIndex].max, label: `${jointLimits[jointIndex].max}°` }
                  ]}
                  valueLabelDisplay="auto"
                  disabled={manualMode || !torqueEnabled[jointIndex]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      backgroundColor: torqueEnabled[jointIndex] ? 'primary.main' : 'grey.500'
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: torqueEnabled[jointIndex] ? 'primary.main' : 'grey.500'
                    }
                  }}
                />
              </Box>
            ))}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleMoveToPosition}
                disabled={manualMode || !torqueEnabled.some(Boolean)}
                size="large"
              >
                Move to Position
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleHomePosition}
                disabled={manualMode}
              >
                Home Position
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleEmergencyStop}
                size="large"
              >
                Emergency Stop
              </Button>
            </Box>
          </Grid>

          {/* Status Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Robot Status
            </Typography>
            
            {/* Current Joint Angles */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Joint Angles:
              </Typography>
              {jointAngles.map((angle, index) => (
                <Typography key={index} variant="body2">
                  Joint {index + 1}: {formatNumber(radToDeg(angle))}°
                </Typography>
              ))}
            </Box>

            {/* Joint Velocities */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Joint Velocities:
              </Typography>
              {jointVelocities.map((velocity, index) => (
                <Typography key={index} variant="body2">
                  Joint {index + 1}: {formatNumber(radToDeg(velocity))}°/s
                </Typography>
              ))}
            </Box>

            {/* Hardware Status */}
            {Object.keys(actuators || {}).length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hardware Status:
                </Typography>
                {Object.entries(actuators).map(([id, actuator]) => (
                  <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Motor {id}:</Typography>
                    <Typography 
                      variant="body2"
                      color={
                        actuator.hardware_error > 0 ? 'error' :
                        actuator.present_temperature > 60 ? 'warning' : 'success'
                      }
                    >
                      {actuator.present_temperature?.toFixed(1)}°C
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Advanced Controls */}
        {showAdvanced && (
          <Box sx={{ mt: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Advanced Controls</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Velocity Limits */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Velocity Limits (°/s):
                    </Typography>
                    {velocityLimits.map((limit, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="caption">
                          Joint {index + 1}: {limit}°/s
                        </Typography>
                        <Slider
                          value={limit}
                          onChange={handleVelocityChange(index)}
                          min={1}
                          max={60}
                          step={1}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Grid>

                  {/* Presets */}
                  {enablePresets && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        Position Presets:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.keys(presets).map((presetName) => (
                          <Box key={presetName} sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant={selectedPreset === presetName ? "contained" : "outlined"}
                              size="small"
                              onClick={() => handlePresetLoad(presetName)}
                              sx={{ flex: 1 }}
                            >
                              {presetName}
                            </Button>
                            <Tooltip title="Save current position">
                              <IconButton
                                size="small"
                                onClick={() => handlePresetSave(presetName)}
                              >
                                <Save />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ControlPanel;