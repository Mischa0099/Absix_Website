// ===== PDControlChallenge.jsx =====
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Slider,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { PlayArrow, Stop, Tune } from '@mui/icons-material';
import robotService from '../../services/robotService';

const PDControlChallenge = ({ challenge, onDataChange, onError, started }) => {
  const dispatch = useDispatch();
  const { connected, jointAngles } = useSelector(state => state.robot);
  
  const [kp, setKp] = useState(400);
  const [kd, setKd] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [selectedJoint, setSelectedJoint] = useState(1);
  const [controlActive, setControlActive] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [settleTime, setSettleTime] = useState(null);
  const [overshoot, setOvershoot] = useState(null);
  const [steadyStateError, setSteadyStateError] = useState(null);
  const [autoTune, setAutoTune] = useState(false);

  useEffect(() => {
    onDataChange && onDataChange({
      kp,
      kd,
      targetPosition,
      selectedJoint,
      settleTime,
      overshoot,
      steadyStateError,
      responseData: responseData.slice(-100) // Keep last 100 points
    });
  }, [kp, kd, targetPosition, selectedJoint, settleTime, overshoot, steadyStateError, responseData]);

  const startControl = async () => {
    try {
      if (!connected) {
        onError('Robot not connected');
        return;
      }

      setControlActive(true);
      setResponseData([]);
      
      const response = await robotService.setPDControl(selectedJoint, {
        kp,
        kd,
        target: targetPosition
      });

      // Start monitoring response
      monitorResponse();
      
    } catch (error) {
      onError('Failed to start PD control');
      setControlActive(false);
    }
  };

  const stopControl = async () => {
    try {
      await robotService.stopPDControl(selectedJoint);
      setControlActive(false);
      analyzeResponse();
    } catch (error) {
      onError('Failed to stop PD control');
    }
  };

  const monitorResponse = () => {
    const interval = setInterval(async () => {
      if (!controlActive) {
        clearInterval(interval);
        return;
      }

      try {
        const currentAngle = jointAngles[selectedJoint - 1] || 0;
        const timestamp = Date.now();
        
        setResponseData(prev => [...prev, {
          time: timestamp,
          position: currentAngle,
          target: targetPosition,
          error: targetPosition - currentAngle
        }]);

        // Stop after 10 seconds or when settled
        if (responseData.length > 1000 || Math.abs(targetPosition - currentAngle) < 1) {
          clearInterval(interval);
          setControlActive(false);
          analyzeResponse();
        }
      } catch (error) {
        clearInterval(interval);
        setControlActive(false);
      }
    }, 10); // 100Hz sampling
  };

  const analyzeResponse = () => {
    if (responseData.length < 10) return;

    // Calculate settle time (time to reach and stay within 2% of target)
    const finalValue = targetPosition;
    const tolerance = Math.abs(finalValue) * 0.02 + 1; // 2% + 1 degree
    
    let settleIndex = -1;
    for (let i = responseData.length - 1; i >= 0; i--) {
      if (Math.abs(responseData[i].error) > tolerance) {
        settleIndex = i + 1;
        break;
      }
    }

    if (settleIndex > 0) {
      const settleTimeMs = responseData[settleIndex].time - responseData[0].time;
      setSettleTime(settleTimeMs / 1000); // Convert to seconds
    }

    // Calculate overshoot
    const maxValue = Math.max(...responseData.map(d => d.position));
    const minValue = Math.min(...responseData.map(d => d.position));
    
    let overshootPercent = 0;
    if (targetPosition > responseData[0].position) {
      overshootPercent = Math.max(0, (maxValue - finalValue) / Math.abs(finalValue) * 100);
    } else {
      overshootPercent = Math.max(0, (finalValue - minValue) / Math.abs(finalValue) * 100);
    }
    setOvershoot(overshootPercent);

    // Calculate steady-state error
    const lastValues = responseData.slice(-50); // Last 50 samples
    const avgFinalValue = lastValues.reduce((sum, d) => sum + d.position, 0) / lastValues.length;
    setSteadyStateError(Math.abs(finalValue - avgFinalValue));
  };

  const performAutoTune = async () => {
    try {
      setAutoTune(true);
      const response = await robotService.autoTunePD(selectedJoint, targetPosition);
      setKp(response.data.kp);
      setKd(response.data.kd);
    } catch (error) {
      onError('Auto-tune failed');
    } finally {
      setAutoTune(false);
    }
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value === null) return 'text.secondary';
    if (value <= thresholds.excellent) return 'success.main';
    if (value <= thresholds.good) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        PD Control Tuning Challenge
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Tune the PD controller parameters (Kp and Kd) to achieve optimal step response performance.
        Minimize settle time, overshoot, and steady-state error.
      </Typography>

      <Grid container spacing={3}>
        {/* Control Parameters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Control Parameters
              </Typography>
              
              {/* Joint Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Joint</InputLabel>
                <Select
                  value={selectedJoint}
                  label="Joint"
                  onChange={(e) => setSelectedJoint(e.target.value)}
                  disabled={controlActive}
                >
                  <MenuItem value={1}>Joint 1</MenuItem>
                  <MenuItem value={2}>Joint 2</MenuItem>
                  <MenuItem value={3}>Joint 3</MenuItem>
                </Select>
              </FormControl>

              {/* Target Position */}
              <TextField
                fullWidth
                label="Target Position (degrees)"
                type="number"
                value={targetPosition}
                onChange={(e) => setTargetPosition(Number(e.target.value))}
                disabled={controlActive}
                sx={{ mb: 2 }}
                inputProps={{ min: -90, max: 90 }}
              />

              {/* Kp Parameter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Proportional Gain (Kp): {kp}
                </Typography>
                <Slider
                  value={kp}
                  onChange={(e, value) => setKp(value)}
                  min={0}
                  max={1000}
                  step={10}
                  disabled={controlActive}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Kd Parameter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Derivative Gain (Kd): {kd}
                </Typography>
                <Slider
                  value={kd}
                  onChange={(e, value) => setKd(value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={controlActive}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Auto-tune Option */}
              <FormControlLabel
                control={
                  <Switch
                    checked={autoTune}
                    onChange={(e) => setAutoTune(e.target.checked)}
                    disabled={controlActive}
                  />
                }
                label="Auto-tune enabled"
                sx={{ mb: 2 }}
              />

              {/* Control Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {!controlActive ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={startControl}
                      startIcon={<PlayArrow />}
                      disabled={!connected}
                    >
                      Start Test
                    </Button>
                    {autoTune && (
                      <Button
                        variant="outlined"
                        onClick={performAutoTune}
                        startIcon={<Tune />}
                        disabled={!connected}
                      >
                        Auto Tune
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={stopControl}
                    startIcon={<Stop />}
                  >
                    Stop Test
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              
              {/* Settle Time */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Settle Time
                </Typography>
                <Typography 
                  variant="h5" 
                  color={getPerformanceColor(settleTime, { excellent: 2, good: 5 })}
                >
                  {settleTime !== null ? `${settleTime.toFixed(2)}s` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: &lt; 2s (excellent), &lt; 5s (good)
                </Typography>
              </Box>

              {/* Overshoot */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overshoot
                </Typography>
                <Typography 
                  variant="h5" 
                  color={getPerformanceColor(overshoot, { excellent: 5, good: 15 })}
                >
                  {overshoot !== null ? `${overshoot.toFixed(1)}%` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: &lt; 5% (excellent), &lt; 15% (good)
                </Typography>
              </Box>

              {/* Steady-State Error */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Steady-State Error
                </Typography>
                <Typography 
                  variant="h5" 
                  color={getPerformanceColor(steadyStateError, { excellent: 1, good: 3 })}
                >
                  {steadyStateError !== null ? `${steadyStateError.toFixed(2)}°` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: &lt; 1° (excellent), &lt; 3° (good)
                </Typography>
              </Box>

              {/* Current Status */}
              <Alert 
                severity={controlActive ? "info" : connected ? "success" : "warning"}
                sx={{ mt: 2 }}
              >
                {controlActive 
                  ? "Control loop active - monitoring response..." 
                  : connected 
                    ? "Ready to start PD control test" 
                    : "Robot not connected"
                }
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Response Plot Placeholder */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step Response
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography color="text.secondary">
                  {responseData.length > 0 
                    ? `Response data: ${responseData.length} samples` 
                    : "Start a test to see the step response plot"
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PDControlChallenge;