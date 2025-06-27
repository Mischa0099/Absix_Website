// =================== JointController.jsx ===================
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Lock,
  LockOpen,
  Warning,
  Info,
  Settings,
  Refresh
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { radToDeg, degToRad, formatNumber } from '../../utils/helpers';
import { StatusIndicator } from '../common';

const JointController = ({ 
  jointIndex, 
  label,
  limits = { min: -180, max: 180 },
  showAdvanced = false 
}) => {
  const { 
    jointAngles, 
    targetAngles,
    jointVelocities,
    setJointAngle,
    enableTorque,
    disableTorque
  } = useRobot();
  
  const [localAngle, setLocalAngle] = useState(0);
  const [torqueEnabled, setTorqueEnabled] = useState(false);
  const [velocityLimit, setVelocityLimit] = useState(30);
  const [positionLimit, setPositionLimit] = useState(limits);
  const [error, setError] = useState(null);
  const [moving, setMoving] = useState(false);

  const currentAngle = jointAngles[jointIndex] || 0;
  const currentVelocity = jointVelocities[jointIndex] || 0;
  const targetAngle = targetAngles[jointIndex] || 0;

  useEffect(() => {
    setLocalAngle(radToDeg(currentAngle));
  }, [currentAngle]);

  const handleAngleChange = (event, newValue) => {
    setLocalAngle(newValue);
  };

  const handleAngleCommit = async (event, newValue) => {
    if (!torqueEnabled) {
      setError('Cannot move joint - torque is disabled');
      return;
    }

    try {
      setMoving(true);
      setError(null);
      const success = await setJointAngle(jointIndex, degToRad(newValue));
      
      if (!success) {
        setError('Failed to move joint');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setMoving(false);
    }
  };

  const handleTorqueToggle = async () => {
    try {
      const actuatorId = jointIndex + 1;
      const success = torqueEnabled 
        ? await disableTorque(actuatorId)
        : await enableTorque(actuatorId);
      
      if (success) {
        setTorqueEnabled(!torqueEnabled);
        setError(null);
      } else {
        setError('Failed to toggle torque');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getJointStatus = () => {
    if (error) return 'error';
    if (moving) return 'moving';
    if (torqueEnabled) return 'active';
    return 'inactive';
  };

  const getStatusColor = () => {
    switch (getJointStatus()) {
      case 'error': return 'error';
      case 'moving': return 'warning';
      case 'active': return 'success';
      default: return 'default';
    }
  };

  const isAtTarget = Math.abs(radToDeg(currentAngle) - radToDeg(targetAngle)) < 1;
  const velocityPercentage = Math.abs(currentVelocity) / (degToRad(velocityLimit)) * 100;

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {label || `Joint ${jointIndex + 1}`}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusIndicator
              status={getJointStatus()}
              variant="dot"
              size="small"
            />
            
            <Tooltip title={torqueEnabled ? "Disable Torque" : "Enable Torque"}>
              <IconButton
                size="small"
                onClick={handleTorqueToggle}
                color={torqueEnabled ? "success" : "default"}
              >
                {torqueEnabled ? <LockOpen /> : <Lock />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Status */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Position
            </Typography>
            <Chip
              label={`${formatNumber(radToDeg(currentAngle))}°`}
              size="small"
              color={isAtTarget ? 'success' : 'primary'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Target Position
            </Typography>
            <Chip
              label={`${formatNumber(radToDeg(targetAngle))}°`}
              size="small"
              variant="filled"
            />
          </Box>
        </Box>

        {/* Velocity Indicator */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Velocity
            </Typography>
            <Typography variant="caption">
              {formatNumber(radToDeg(Math.abs(currentVelocity)))}°/s
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(100, velocityPercentage)}
            color={velocityPercentage > 80 ? 'warning' : 'primary'}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        {/* Position Control */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Position Control
          </Typography>
          <Slider
            value={localAngle}
            onChange={handleAngleChange}
            onChangeCommitted={handleAngleCommit}
            min={positionLimit.min}
            max={positionLimit.max}
            step={0.5}
            marks={[
              { value: positionLimit.min, label: `${positionLimit.min}°` },
              { value: 0, label: '0°' },
              { value: positionLimit.max, label: `${positionLimit.max}°` }
            ]}
            valueLabelDisplay="auto"
            disabled={!torqueEnabled || moving}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: torqueEnabled ? 'primary.main' : 'grey.500'
              },
              '& .MuiSlider-track': {
                backgroundColor: torqueEnabled ? 'primary.main' : 'grey.500'
              }
            }}
          />
        </Box>

        {/* Advanced Controls */}
        {showAdvanced && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Advanced Settings
            </Typography>
            
            <TextField
              label="Velocity Limit (°/s)"
              type="number"
              value={velocityLimit}
              onChange={(e) => setVelocityLimit(Number(e.target.value))}
              size="small"
              fullWidth
              sx={{ mb: 1 }}
              inputProps={{ min: 1, max: 100 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Min (°)"
                type="number"
                value={positionLimit.min}
                onChange={(e) => setPositionLimit(prev => ({ ...prev, min: Number(e.target.value) }))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Max (°)"
                type="number"
                value={positionLimit.max}
                onChange={(e) => setPositionLimit(prev => ({ ...prev, max: Number(e.target.value) }))}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        )}

        {/* Status Indicators */}
        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={torqueEnabled ? "Torque ON" : "Torque OFF"}
            size="small"
            color={torqueEnabled ? "success" : "default"}
            variant="outlined"
          />
          {moving && (
            <Chip
              label="Moving"
              size="small"
              color="warning"
              variant="filled"
            />
          )}
          {isAtTarget && (
            <Chip
              label="At Target"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default JointController;