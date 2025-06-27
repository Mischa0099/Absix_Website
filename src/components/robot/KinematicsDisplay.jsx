// =================== KinematicsDisplay.jsx ===================
import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Calculate,
  Timeline,
  Transform,
  MyLocation
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { radToDeg, degToRad, formatNumber } from '../../utils/helpers';
import RobotVisualizer from './RobotVisualizer';

const KinematicsDisplay = () => {
  const { jointAngles, setJointAngles, connected } = useRobot();
  
  const [tabValue, setTabValue] = useState(0);
  const [inputAngles, setInputAngles] = useState([0, 0, 0]);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, z: 0 });
  const [endEffectorPos, setEndEffectorPos] = useState({ x: 0, y: 0, z: 0 });
  const [jacobianMatrix, setJacobianMatrix] = useState([]);
  const [singularityDetected, setSingularityDetected] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [error, setError] = useState(null);

  // Robot parameters
  const linkLengths = [0.10, 0.07, 0.05]; // meters
  const linkOffsets = [0, 0, 0]; // meters

  // Update input angles when robot moves
  useEffect(() => {
    if (realTimeUpdate && jointAngles.length > 0) {
      setInputAngles(jointAngles.map(radToDeg));
    }
  }, [jointAngles, realTimeUpdate]);

  // Forward kinematics calculation
  const forwardKinematics = useMemo(() => {
    const angles = inputAngles.map(degToRad);
    
    // Calculate end effector position using DH parameters
    let x = 0, y = 0, z = 0;
    let currentAngle = 0;

    // Link 1 (Base rotation)
    currentAngle = angles[0];
    const baseX = linkLengths[0] * Math.cos(currentAngle);
    const baseY = linkLengths[0] * Math.sin(currentAngle);

    // Link 2 (Shoulder)
    const shoulderAngle = currentAngle + angles[1];
    const shoulderX = baseX + linkLengths[1] * Math.cos(shoulderAngle);
    const shoulderY = baseY + linkLengths[1] * Math.sin(shoulderAngle);

    // Link 3 (Elbow)
    const elbowAngle = shoulderAngle + angles[2];
    x = shoulderX + linkLengths[2] * Math.cos(elbowAngle);
    y = shoulderY + linkLengths[2] * Math.sin(elbowAngle);
    z = 0; // 2D robot in XY plane

    return { x, y, z, angles: [currentAngle, shoulderAngle, elbowAngle] };
  }, [inputAngles, linkLengths]);

  // Inverse kinematics calculation
  const inverseKinematics = (targetX, targetY, targetZ = 0) => {
    try {
      const x = targetX;
      const y = targetY;
      const r = Math.sqrt(x * x + y * y);
      
      // Check if target is reachable
      const maxReach = linkLengths.reduce((sum, length) => sum + length, 0);
      const minReach = Math.abs(linkLengths[0] - linkLengths[1] - linkLengths[2]);
      
      if (r > maxReach || r < minReach) {
        throw new Error('Target position is unreachable');
      }
      
      // Calculate base angle
      const theta1 = Math.atan2(y, x);
      
      // Calculate end effector distance from shoulder joint
      const shoulderX = linkLengths[0] * Math.cos(theta1);
      const shoulderY = linkLengths[0] * Math.sin(theta1);
      const dx = x - shoulderX;
      const dy = y - shoulderY;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate elbow angle using law of cosines
      const cosTheta3 = (d * d - linkLengths[1] * linkLengths[1] - linkLengths[2] * linkLengths[2]) /
                        (2 * linkLengths[1] * linkLengths[2]);
      
      if (Math.abs(cosTheta3) > 1) {
        throw new Error('No valid solution found');
      }
      
      const theta3 = Math.acos(cosTheta3);
      
      // Calculate shoulder angle
      const alpha = Math.atan2(dy, dx);
      const beta = Math.acos((linkLengths[1] * linkLengths[1] + d * d - linkLengths[2] * linkLengths[2]) /
                            (2 * linkLengths[1] * d));
      const theta2 = alpha - beta;
      
      return {
        success: true,
        angles: [theta1, theta2, theta3].map(radToDeg),
        error: null
      };
    } catch (err) {
      return {
        success: false,
        angles: [0, 0, 0],
        error: err.message
      };
    }
  };

  // Jacobian matrix calculation
  const calculateJacobian = (angles) => {
    const [theta1, theta2, theta3] = angles.map(degToRad);
    
    // Partial derivatives of forward kinematics
    // ∂x/∂θ, ∂y/∂θ for each joint
    const j11 = -linkLengths[0] * Math.sin(theta1) - linkLengths[1] * Math.sin(theta1 + theta2) - linkLengths[2] * Math.sin(theta1 + theta2 + theta3);
    const j12 = -linkLengths[1] * Math.sin(theta1 + theta2) - linkLengths[2] * Math.sin(theta1 + theta2 + theta3);
    const j13 = -linkLengths[2] * Math.sin(theta1 + theta2 + theta3);
    
    const j21 = linkLengths[0] * Math.cos(theta1) + linkLengths[1] * Math.cos(theta1 + theta2) + linkLengths[2] * Math.cos(theta1 + theta2 + theta3);
    const j22 = linkLengths[1] * Math.cos(theta1 + theta2) + linkLengths[2] * Math.cos(theta1 + theta2 + theta3);
    const j23 = linkLengths[2] * Math.cos(theta1 + theta2 + theta3);
    
    const jacobian = [
      [j11, j12, j13],
      [j21, j22, j23]
    ];
    
    // Check for singularities (determinant ≈ 0)
    const det = j11 * j22 - j12 * j21;
    setSingularityDetected(Math.abs(det) < 0.001);
    
    return jacobian;
  };

  useEffect(() => {
    setEndEffectorPos(forwardKinematics);
    setJacobianMatrix(calculateJacobian(inputAngles));
  }, [inputAngles, forwardKinematics]);

  const handleAngleChange = (index) => (event) => {
    const newAngles = [...inputAngles];
    newAngles[index] = parseFloat(event.target.value) || 0;
    setInputAngles(newAngles);
  };

  const handlePositionChange = (axis) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setTargetPosition(prev => ({ ...prev, [axis]: value }));
  };

  const handleForwardKinematics = async () => {
    if (!connected) {
      setError('Robot not connected');
      return;
    }
    
    try {
      const angles = inputAngles.map(degToRad);
      await setJointAngles(angles);
      setError(null);
    } catch (err) {
      setError(`Failed to move robot: ${err.message}`);
    }
  };

  const handleInverseKinematics = () => {
    const result = inverseKinematics(targetPosition.x, targetPosition.y, targetPosition.z);
    
    if (result.success) {
      setInputAngles(result.angles);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <Paper sx={{ bgcolor: 'background.paper' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Forward Kinematics" icon={<Calculate />} />
          <Tab label="Inverse Kinematics" icon={<MyLocation />} />
          <Tab label="Jacobian Analysis" icon={<Transform />} />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Controls */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={realTimeUpdate}
                onChange={(e) => setRealTimeUpdate(e.target.checked)}
              />
            }
            label="Real-time update from robot"
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Singularity Warning */}
        {singularityDetected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Singularity detected! Robot may have limited mobility in this configuration.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Controls Column */}
          <Grid item xs={12} md={6}>
            {/* Forward Kinematics Tab */}
            {tabValue === 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calculate />
                    Forward Kinematics
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Input joint angles to calculate end effector position.
                  </Typography>
                  
                  {/* Joint Angle Inputs */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {inputAngles.map((angle, index) => (
                      <Grid item xs={4} key={index}>
                        <TextField
                          label={`θ${index + 1} (°)`}
                          type="number"
                          value={formatNumber(angle)}
                          onChange={handleAngleChange(index)}
                          fullWidth
                          inputProps={{ step: 0.1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Results */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      End Effector Position:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          label="X (mm)"
                          value={formatNumber(endEffectorPos.x * 1000)}
                          disabled
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Y (mm)"
                          value={formatNumber(endEffectorPos.y * 1000)}
                          disabled
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Z (mm)"
                          value={formatNumber(endEffectorPos.z * 1000)}
                          disabled
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Button
                    variant="contained"
                    onClick={handleForwardKinematics}
                    disabled={!connected}
                    fullWidth
                  >
                    Move Robot to Position
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Inverse Kinematics Tab */}
            {tabValue === 1 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MyLocation />
                    Inverse Kinematics
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Input target position to calculate required joint angles.
                  </Typography>
                  
                  {/* Position Inputs */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <TextField
                        label="X (mm)"
                        type="number"
                        value={targetPosition.x * 1000}
                        onChange={(e) => setTargetPosition(prev => ({ ...prev, x: parseFloat(e.target.value) / 1000 || 0 }))}
                        fullWidth
                        inputProps={{ step: 1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Y (mm)"
                        type="number"
                        value={targetPosition.y * 1000}
                        onChange={(e) => setTargetPosition(prev => ({ ...prev, y: parseFloat(e.target.value) / 1000 || 0 }))}
                        fullWidth
                        inputProps={{ step: 1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Z (mm)"
                        type="number"
                        value={targetPosition.z * 1000}
                        onChange={(e) => setTargetPosition(prev => ({ ...prev, z: parseFloat(e.target.value) / 1000 || 0 }))}
                        fullWidth
                        inputProps={{ step: 1 }}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    onClick={handleInverseKinematics}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Calculate Joint Angles
                  </Button>
                  
                  {/* Results */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Calculated Joint Angles:
                    </Typography>
                    <Grid container spacing={2}>
                      {inputAngles.map((angle, index) => (
                        <Grid item xs={4} key={index}>
                          <TextField
                            label={`θ${index + 1} (°)`}
                            value={formatNumber(angle)}
                            disabled
                            fullWidth
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Jacobian Analysis Tab */}
            {tabValue === 2 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Transform />
                    Jacobian Analysis
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Relationship between joint velocities and end effector velocities.
                  </Typography>
                  
                  {/* Jacobian Matrix Display */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Jacobian Matrix:
                    </Typography>
                    <Box sx={{ 
                      fontFamily: 'monospace', 
                      bgcolor: 'rgba(255, 255, 255, 0.05)', 
                      p: 2, 
                      borderRadius: 1,
                      fontSize: '0.875rem'
                    }}>
                      {jacobianMatrix.map((row, i) => (
                        <div key={i}>
                          [{row.map(val => formatNumber(val, 4)).join(', ')}]
                        </div>
                      ))}
                    </Box>
                  </Box>
                  
                  {/* Singularity Analysis */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Singularity Analysis:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={singularityDetected ? 'error' : 'success'}
                    >
                      {singularityDetected 
                        ? 'Singularity detected - robot has reduced degrees of freedom'
                        : 'No singularity detected - robot has full mobility'
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Visualization Column */}
          <Grid item xs={12} md={6}>
            <RobotVisualizer
              height={400}
              showTarget={true}
              showLabels={true}
              showControls={false}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default KinematicsDisplay;
