// =================== TrajectoryPlanner.jsx ===================
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Delete,
  PlayArrow,
  Stop,
  Timeline,
  Save,
  Restore,
  Edit,
  Visibility
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { formatNumber, degToRad, radToDeg } from '../../utils/helpers';
import RobotVisualizer from './RobotVisualizer';
import { useNotification } from '../common/Notification';

const TrajectoryPlanner = () => {
  const { 
    connected, 
    jointAngles, 
    setJointAngles, 
    setJointVelocity,
    sendCommand 
  } = useRobot();
  const { showNotification } = useNotification();

  const [waypoints, setWaypoints] = useState([]);
  const [currentWaypoint, setCurrentWaypoint] = useState({
    name: '',
    angles: [0, 0, 0],
    velocity: 30,
    acceleration: 100,
    duration: 1.0
  });
  const [trajectoryType, setTrajectoryType] = useState('linear'); // 'linear', 'cubic', 'quintic'
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedTrajectories, setSavedTrajectories] = useState([]);
  const [selectedTrajectory, setSelectedTrajectory] = useState('');

  // Load saved trajectories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('robotTrajectories');
    if (saved) {
      try {
        setSavedTrajectories(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved trajectories:', error);
      }
    }
  }, []);

  // Initialize current waypoint with robot's current position
  useEffect(() => {
    if (jointAngles.length > 0 && waypoints.length === 0) {
      setCurrentWaypoint(prev => ({
        ...prev,
        angles: jointAngles.map(radToDeg)
      }));
    }
  }, [jointAngles, waypoints.length]);

  const handleAngleChange = (index) => (event) => {
    const newAngles = [...currentWaypoint.angles];
    newAngles[index] = parseFloat(event.target.value) || 0;
    setCurrentWaypoint(prev => ({ ...prev, angles: newAngles }));
  };

  const handleAddWaypoint = () => {
    if (!currentWaypoint.name.trim()) {
      showNotification('Please enter a waypoint name', 'warning');
      return;
    }

    const newWaypoint = {
      ...currentWaypoint,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setWaypoints(prev => [...prev, newWaypoint]);
    setCurrentWaypoint(prev => ({
      ...prev,
      name: '',
      angles: [...prev.angles] // Keep current angles for next waypoint
    }));
    
    showNotification('Waypoint added successfully', 'success');
  };

  const handleDeleteWaypoint = (id) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
    showNotification('Waypoint deleted', 'info');
  };

  const handleEditWaypoint = (waypoint) => {
    setCurrentWaypoint(waypoint);
    handleDeleteWaypoint(waypoint.id);
  };

  const handleUseCurrentPosition = () => {
    if (jointAngles.length > 0) {
      setCurrentWaypoint(prev => ({
        ...prev,
        angles: jointAngles.map(radToDeg)
      }));
      showNotification('Current position loaded', 'info');
    }
  };

  const generateTrajectory = () => {
    if (waypoints.length < 2) {
      showNotification('At least 2 waypoints required for trajectory', 'warning');
      return [];
    }

    const trajectory = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const duration = end.duration;
      const steps = Math.ceil(duration * 50); // 50 Hz trajectory
      
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const interpolatedPoint = interpolateWaypoints(start, end, t, trajectoryType);
        trajectory.push({
          ...interpolatedPoint,
          waypointIndex: i,
          progress: t,
          timestamp: (trajectory.length * 0.02) // 20ms per step
        });
      }
    }
    
    return trajectory;
  };

  const interpolateWaypoints = (start, end, t, type) => {
    let interpolatedAngles;
    
    switch (type) {
      case 'linear':
        interpolatedAngles = start.angles.map((startAngle, index) => {
          const endAngle = end.angles[index];
          return startAngle + (endAngle - startAngle) * t;
        });
        break;
        
      case 'cubic':
        interpolatedAngles = start.angles.map((startAngle, index) => {
          const endAngle = end.angles[index];
          const t2 = t * t;
          const t3 = t2 * t;
          return startAngle + (endAngle - startAngle) * (3 * t2 - 2 * t3);
        });
        break;
        
      case 'quintic':
        interpolatedAngles = start.angles.map((startAngle, index) => {
          const endAngle = end.angles[index];
          const t3 = t * t * t;
          const t4 = t3 * t;
          const t5 = t4 * t;
          return startAngle + (endAngle - startAngle) * (10 * t3 - 15 * t4 + 6 * t5);
        });
        break;
        
      default:
        interpolatedAngles = start.angles;
    }
    
    return {
      angles: interpolatedAngles,
      velocity: start.velocity + (end.velocity - start.velocity) * t,
      acceleration: start.acceleration + (end.acceleration - start.acceleration) * t
    };
  };

  const executeTrajectory = async () => {
    if (!connected) {
      showNotification('Robot not connected', 'error');
      return;
    }

    if (waypoints.length < 2) {
      showNotification('At least 2 waypoints required', 'warning');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      const trajectory = generateTrajectory();
      
      for (let i = 0; i < trajectory.length; i++) {
        const point = trajectory[i];
        
        // Send position command to robot
        await setJointAngles(point.angles.map(degToRad));
        
        // Update progress
        setExecutionProgress((i / trajectory.length) * 100);
        
        // Wait for next step (20ms for 50Hz)
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Check if execution was stopped
        if (!isExecuting) break;
      }
      
      showNotification('Trajectory execution completed', 'success');
    } catch (error) {
      showNotification(`Trajectory execution failed: ${error.message}`, 'error');
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  const stopExecution = () => {
    setIsExecuting(false);
    sendCommand('stop_motion');
    showNotification('Trajectory execution stopped', 'warning');
  };

  const saveTrajectory = () => {
    if (waypoints.length === 0) {
      showNotification('No waypoints to save', 'warning');
      return;
    }

    const name = prompt('Enter trajectory name:');
    if (!name) return;

    const trajectory = {
      id: Date.now(),
      name,
      waypoints,
      trajectoryType,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedTrajectories, trajectory];
    setSavedTrajectories(updated);
    localStorage.setItem('robotTrajectories', JSON.stringify(updated));
    
    showNotification('Trajectory saved successfully', 'success');
  };

  const loadTrajectory = (trajectory) => {
    setWaypoints(trajectory.waypoints);
    setTrajectoryType(trajectory.trajectoryType);
    setSelectedTrajectory(trajectory.name);
    showNotification(`Trajectory "${trajectory.name}" loaded`, 'success');
  };

  const clearWaypoints = () => {
    setWaypoints([]);
    setSelectedTrajectory('');
    showNotification('All waypoints cleared', 'info');
  };

  return (
    <Paper sx={{ bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline color="primary" />
          Trajectory Planner
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Plan and execute smooth robot trajectories through multiple waypoints.
        </Typography>

        <Grid container spacing={3}>
          {/* Control Panel */}
          <Grid item xs={12} md={6}>
            {/* Waypoint Creation */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Add Waypoint
                </Typography>
                
                <TextField
                  label="Waypoint Name"
                  value={currentWaypoint.name}
                  onChange={(e) => setCurrentWaypoint(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                {/* Joint Angles */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {currentWaypoint.angles.map((angle, index) => (
                    <Grid item xs={4} key={index}>
                      <TextField
                        label={`Joint ${index + 1} (°)`}
                        type="number"
                        value={formatNumber(angle)}
                        onChange={handleAngleChange(index)}
                        fullWidth
                        inputProps={{ step: 0.1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Motion Parameters */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <TextField
                      label="Velocity (°/s)"
                      type="number"
                      value={currentWaypoint.velocity}
                      onChange={(e) => setCurrentWaypoint(prev => ({ ...prev, velocity: parseFloat(e.target.value) || 0 }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Acceleration (°/s²)"
                      type="number"
                      value={currentWaypoint.acceleration}
                      onChange={(e) => setCurrentWaypoint(prev => ({ ...prev, acceleration: parseFloat(e.target.value) || 0 }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Duration (s)"
                      type="number"
                      value={currentWaypoint.duration}
                      onChange={(e) => setCurrentWaypoint(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                      fullWidth
                      inputProps={{ step: 0.1, min: 0.1 }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddWaypoint}
                    disabled={!currentWaypoint.name.trim()}
                  >
                    Add Waypoint
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleUseCurrentPosition}
                    disabled={!connected}
                  >
                    Use Current Position
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Trajectory Settings */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Trajectory Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Interpolation Type</InputLabel>
                  <Select
                    value={trajectoryType}
                    onChange={(e) => setTrajectoryType(e.target.value)}
                    label="Interpolation Type"
                  >
                    <MenuItem value="linear">Linear</MenuItem>
                    <MenuItem value="cubic">Cubic (Smooth)</MenuItem>
                    <MenuItem value="quintic">Quintic (Very Smooth)</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary">
                  {trajectoryType === 'linear' && 'Straight line interpolation between waypoints'}
                  {trajectoryType === 'cubic' && 'Smooth S-curve trajectory with continuous velocity'}
                  {trajectoryType === 'quintic' && 'Very smooth trajectory with continuous acceleration'}
                </Typography>
              </CardContent>
            </Card>

            {/* Saved Trajectories */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Saved Trajectories
                </Typography>
                
                {savedTrajectories.length > 0 ? (
                  <Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Trajectory</InputLabel>
                      <Select
                        value={selectedTrajectory}
                        onChange={(e) => {
                          const trajectory = savedTrajectories.find(t => t.name === e.target.value);
                          if (trajectory) loadTrajectory(trajectory);
                        }}
                        label="Select Trajectory"
                      >
                        {savedTrajectories.map((trajectory) => (
                          <MenuItem key={trajectory.id} value={trajectory.name}>
                            {trajectory.name} ({trajectory.waypoints.length} waypoints)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No saved trajectories
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Waypoints List and Visualization */}
          <Grid item xs={12} md={6}>
            {/* Waypoints List */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Waypoints ({waypoints.length})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Save />}
                      onClick={saveTrajectory}
                      disabled={waypoints.length === 0}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={clearWaypoints}
                      disabled={waypoints.length === 0}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Box>
                
                {waypoints.length > 0 ? (
                  <List dense>
                    {waypoints.map((waypoint, index) => (
                      <ListItem key={waypoint.id} divider>
                        <ListItemText
                          primary={`${index + 1}. ${waypoint.name}`}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Angles: [{waypoint.angles.map(a => formatNumber(a)).join(', ')}]°
                              </Typography>
                              <Typography variant="caption" display="block">
                                Duration: {waypoint.duration}s, Velocity: {waypoint.velocity}°/s
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleEditWaypoint(waypoint)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteWaypoint(waypoint.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No waypoints added yet
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Execution Controls */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Trajectory Execution
                </Typography>
                
                {isExecuting && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Executing trajectory... {formatNumber(executionProgress)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={executionProgress} />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={executeTrajectory}
                    disabled={!connected || waypoints.length < 2 || isExecuting}
                    color="success"
                  >
                    Execute Trajectory
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<Stop />}
                    onClick={stopExecution}
                    disabled={!isExecuting}
                    color="error"
                  >
                    Stop
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setPreviewMode(!previewMode)}
                    disabled={waypoints.length < 2}
                  >
                    {previewMode ? 'Hide' : 'Show'} Preview
                  </Button>
                </Box>
                
                {!connected && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Robot must be connected to execute trajectories
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Robot Visualization */}
        <Box sx={{ mt: 3 }}>
          <RobotVisualizer
            height={300}
            showTarget={previewMode}
            showTrajectory={previewMode}
            showControls={false}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default TrajectoryPlanner;