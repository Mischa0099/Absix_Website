import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PlayArrow,
  Stop,
  Settings,
  Speed,
  Straighten,
  Visibility,
  Home,
  Save,
  FolderOpen,
  Refresh,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { useRobotController } from '../../hooks/useRobotController';
import { robotService } from '../../services/robotService';
import { setRobotData, setConnectionStatus } from '../../store/robotSlice';
import { Warning as Emergency } from '@mui/icons-material';


const ControlPanel = ({ 
  onMeasurePosition, 
  onEmergencyStop, 
  isConnected, 
  isExecuting,
  robotData,
  challengeMode = 'C1',
  onQuickAction
}) => {
  const dispatch = useDispatch();
  const { robot } = useSelector(state => state.robot);
  const [controlMode, setControlMode] = useState('code'); // 'code' | 'manual' | 'auto'
  const [selectedJoint, setSelectedJoint] = useState(1);
  const [manualAngle, setManualAngle] = useState(0);
  const [movementSpeed, setMovementSpeed] = useState(50);
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  
  // Joint configurations
  const jointConfigs = [
    { id: 1, name: 'Base', min: -150, max: 150, color: '#e53e3e', icon: '🔄' },
    { id: 2, name: 'Shoulder', min: -120, max: 120, color: '#38a169', icon: '💪' },
    { id: 3, name: 'Elbow', min: -90, max: 90, color: '#805ad5', icon: '🦾' }
  ];
  
  // Real-time robot status
  const [robotStatus, setRobotStatus] = useState({
    temperature: [45, 42, 38], // °C for each joint
    current: [1.2, 0.8, 0.6], // Amperes
    voltage: 24.1, // Volts
    errors: [],
    lastUpdate: new Date()
  });

  // Handle manual joint movement
  const handleManualMove = async () => {
    if (!isConnected || !safetyEnabled) return;
    
    try {
      const jointConfig = jointConfigs[selectedJoint - 1];
      
      // Safety checks
      if (manualAngle < jointConfig.min || manualAngle > jointConfig.max) {
        onQuickAction(`⚠️ Angle ${manualAngle}° outside safe range [${jointConfig.min}°, ${jointConfig.max}°]`);
        return;
      }
      
      onQuickAction(`🎮 Moving ${jointConfig.name} to ${manualAngle}°`);
      
      // Send movement command through robot service
      await robotService.moveJoint(selectedJoint, manualAngle, {
        speed: movementSpeed,
        acceleration: 50
      });
      
      onQuickAction(`✅ ${jointConfig.name} movement command sent`);
      
    } catch (error) {
      onQuickAction(`❌ Manual movement failed: ${error.message}`);
    }
  };

  // Handle preset positions
  const handlePresetPosition = async (preset) => {
    const presets = {
      home: [0, 0, 0],
      ready: [30, -20, 45],
      safe: [0, -45, 90],
      challenge1: [30, 0, 0]
    };
    
    if (!presets[preset]) return;
    
    try {
      onQuickAction(`🏠 Moving to ${preset} position`);
      
      for (let i = 0; i < presets[preset].length; i++) {
        await robotService.moveJoint(i + 1, presets[preset][i], {
          speed: movementSpeed / 2, // Slower for safety
          acceleration: 30
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between joints
      }
      
      onQuickAction(`✅ Moved to ${preset} position`);
      
    } catch (error) {
      onQuickAction(`❌ Preset movement failed: ${error.message}`);
    }
  };

  // Handle robot connection
  const handleConnect = async () => {
    try {
      onQuickAction('🔌 Connecting to robot hardware...');
      
      const result = await robotService.connect();
      
      if (result.success) {
        dispatch(setConnectionStatus(true));
        onQuickAction('✅ Robot connected successfully');
        
        // Start telemetry updates
        startTelemetryUpdates();
      } else {
        onQuickAction(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      onQuickAction(`❌ Connection error: ${error.message}`);
    }
  };

  // Handle robot disconnect
  const handleDisconnect = async () => {
    try {
      await robotService.disconnect();
      dispatch(setConnectionStatus(false));
      onQuickAction('🔌 Robot disconnected');
    } catch (error) {
      onQuickAction(`❌ Disconnect error: ${error.message}`);
    }
  };

  // Start real-time telemetry updates
  const startTelemetryUpdates = () => {
    const interval = setInterval(async () => {
      if (!isConnected) {
        clearInterval(interval);
        return;
      }
      
      try {
        const telemetry = await robotService.getTelemetry();
        
        if (telemetry) {
          dispatch(setRobotData({
            joint_angles: telemetry.joint_angles,
            joint_velocities: telemetry.joint_velocities,
            timestamp: new Date().toISOString()
          }));
          
          // Update robot status
          setRobotStatus(prev => ({
            ...prev,
            temperature: telemetry.temperature || prev.temperature,
            current: telemetry.current || prev.current,
            voltage: telemetry.voltage || prev.voltage,
            errors: telemetry.errors || [],
            lastUpdate: new Date()
          }));
        }
      } catch (error) {
        console.error('Telemetry update failed:', error);
      }
    }, 100); // 10Hz update rate
  };

  // Emergency stop with confirmation
  const handleEmergencyStopConfirm = () => {
    if (window.confirm('⚠️ EMERGENCY STOP\n\nThis will immediately halt all robot movement.\nContinue?')) {
      onEmergencyStop();
      onQuickAction('🛑 EMERGENCY STOP ACTIVATED');
    }
  };

  // Save current configuration
  const handleSaveConfig = () => {
    const config = {
      joints: robotData?.joint_angles || [0, 0, 0],
      speed: movementSpeed,
      mode: controlMode,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`robot_config_${challengeMode}`, JSON.stringify(config));
    onQuickAction('💾 Configuration saved');
  };

  // Load saved configuration
  const handleLoadConfig = () => {
    try {
      const saved = localStorage.getItem(`robot_config_${challengeMode}`);
      if (saved) {
        const config = JSON.parse(saved);
        setMovementSpeed(config.speed || 50);
        setControlMode(config.mode || 'code');
        onQuickAction('📁 Configuration loaded');
      } else {
        onQuickAction('❌ No saved configuration found');
      }
    } catch (error) {
      onQuickAction('❌ Failed to load configuration');
    }
  };

  // Get joint status indicator
  const getJointStatus = (jointIndex) => {
    if (!robotData?.joint_angles) return 'unknown';
    
    const angle = robotData.joint_angles[jointIndex];
    const config = jointConfigs[jointIndex];
    
    if (Math.abs(angle) > config.max * 0.9) return 'warning'; // Near limit
    if (robotStatus.temperature[jointIndex] > 60) return 'error'; // Too hot
    return 'ok';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok': return <CheckCircle fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      case 'error': return <ErrorIcon fontSize="small" />;
      default: return <RadioButtonUnchecked fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Main Control Panel */}
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            🎮 Robot Control Panel
          </Typography>
          
          <Tooltip title="Advanced Settings">
            <IconButton onClick={() => setShowSettings(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Connection Status */}
        <Alert 
          severity={isConnected ? 'success' : 'warning'} 
          sx={{ mb: 2 }}
          action={
            <Button 
              size="small" 
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isExecuting}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          }
        >
          <Typography variant="body2">
            {isConnected 
              ? '🟢 Robot hardware connected and ready' 
              : '🔴 Robot hardware not connected'
            }
          </Typography>
        </Alert>

        {/* Control Mode Selector */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Control Mode
          </Typography>
          <Grid container spacing={1}>
            {['code', 'manual', 'auto'].map((mode) => (
              <Grid item key={mode}>
                <Button
                  variant={controlMode === mode ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setControlMode(mode)}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {mode === 'code' && '💻'} 
                  {mode === 'manual' && '🎮'} 
                  {mode === 'auto' && '🤖'} 
                  {mode}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Manual Control Panel */}
        {controlMode === 'manual' && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎮 Manual Joint Control
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Joint</InputLabel>
                  <Select
                    value={selectedJoint}
                    onChange={(e) => setSelectedJoint(e.target.value)}
                    label="Select Joint"
                  >
                    {jointConfigs.map((joint) => (
                      <MenuItem key={joint.id} value={joint.id}>
                        {joint.icon} {joint.name} ({joint.min}° to {joint.max}°)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" gutterBottom>
                  Target Angle: {manualAngle}°
                </Typography>
                <Slider
                  value={manualAngle}
                  onChange={(e, value) => setManualAngle(value)}
                  min={jointConfigs[selectedJoint - 1]?.min || -150}
                  max={jointConfigs[selectedJoint - 1]?.max || 150}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  color={getStatusColor(getJointStatus(selectedJoint - 1))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleManualMove}
                  disabled={!isConnected || isExecuting || !safetyEnabled}
                  startIcon={<PlayArrow />}
                  color="secondary"
                >
                  Move {jointConfigs[selectedJoint - 1]?.name} to {manualAngle}°
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Primary Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={onMeasurePosition}
              disabled={!isConnected || isExecuting}
              startIcon={<Straighten />}
              sx={{ 
                background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
                py: 1.5
              }}
            >
              📏 Measure Position
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleEmergencyStopConfirm}
              disabled={!isConnected}
              startIcon={<Emergency />}
              color="error"
              sx={{ 
                py: 1.5,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              🛑 Emergency Stop
            </Button>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1}>
            {[
              { name: 'Home', action: () => handlePresetPosition('home'), icon: '🏠' },
              { name: 'Ready', action: () => handlePresetPosition('ready'), icon: '⚡' },
              { name: 'Safe', action: () => handlePresetPosition('safe'), icon: '🛡️' },
              { name: 'Challenge', action: () => handlePresetPosition('challenge1'), icon: '🎯' }
            ].map((preset) => (
              <Grid item xs={6} sm={3} key={preset.name}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={preset.action}
                  disabled={!isConnected || isExecuting}
                  sx={{ py: 0.5 }}
                >
                  {preset.icon} {preset.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Configuration Actions */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Configuration
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleSaveConfig}
                startIcon={<Save />}
              >
                Save
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleLoadConfig}
                startIcon={<FolderOpen />}
              >
                Load
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Joint Status Panel */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🔧 Joint Status Monitor
        </Typography>
        
        {jointConfigs.map((joint, index) => {
          const status = getJointStatus(index);
          const currentAngle = robotData?.joint_angles?.[index] || 0;
          const temp = robotStatus.temperature[index];
          const current = robotStatus.current[index];
          
          return (
            <Box key={joint.id} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {joint.icon} {joint.name} (Joint {joint.id})
                </Typography>
                <Chip
                  icon={getStatusIcon(status)}
                  label={status.toUpperCase()}
                  color={getStatusColor(status)}
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Position
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {currentAngle.toFixed(1)}°
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Temperature
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      color: temp > 60 ? 'error.main' : temp > 50 ? 'warning.main' : 'text.primary'
                    }}
                  >
                    {temp}°C
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Current
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {current.toFixed(1)}A
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Position bar */}
              <Box sx={{ mt: 1 }}>
                <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      height: '100%',
                      width: `${Math.abs(currentAngle) / joint.max * 50}%`,
                      bgcolor: joint.color,
                      borderRadius: 4,
                      transform: currentAngle >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                    }}
                  />
                  {/* Center line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      height: '100%',
                      width: 2,
                      bgcolor: 'grey.600',
                      transform: 'translateX(-50%)'
                    }}
                  />
                </Box>
                <Box display="flex" justifyContent="between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {joint.min}°
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    0°
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {joint.max}°
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
        
        {/* System Health */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            ⚡ System Health
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Voltage
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {robotStatus.voltage.toFixed(1)}V
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Last Update
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                {robotStatus.lastUpdate.toLocaleTimeString()}
              </Typography>
            </Grid>
          </Grid>
          
          {robotStatus.errors.length > 0 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {robotStatus.errors.join(', ')}
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚙️ Advanced Robot Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Movement Speed
            </Typography>
            <Slider
              value={movementSpeed}
              onChange={(e, value) => setMovementSpeed(value)}
              min={1}
              max={100}
              step={1}
              marks={[
                { value: 1, label: 'Slow' },
                { value: 50, label: 'Normal' },
                { value: 100, label: 'Fast' }
              ]}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={safetyEnabled}
                  onChange={(e) => setSafetyEnabled(e.target.checked)}
                />
              }
              label="Enable Safety Limits"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={calibrationMode}
                  onChange={(e) => setCalibrationMode(e.target.checked)}
                />
              }
              label="Calibration Mode"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Calibration mode allows movement beyond normal joint limits for setup purposes.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ControlPanel;