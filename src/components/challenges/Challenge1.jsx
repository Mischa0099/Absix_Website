// src/challenges/Challenge1.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Grid,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Usb,
  UsbOff,
  Search,
  PowerSettingsNew,
  PowerOff,
  Home,
  Warning,
  PlayArrow,
  ReadMore,
  CheckCircle,
  SkipNext,
  Refresh,
  RestartAlt,
  Clear
} from '@mui/icons-material';

const Challenge1 = () => {
  // WebSerial state
  const [port, setPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState(null);
  const [uptime, setUptime] = useState('00:00:00');
  
  // Challenge state
  const [currentTask, setCurrentTask] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [taskResults, setTaskResults] = useState([]);
  const [currentAngles, setCurrentAngles] = useState([0, 0, 0]);
  const [targetAngles, setTargetAngles] = useState([0, 0, 0]);
  const [errors, setErrors] = useState([0, 0, 0]);
  const [maxError, setMaxError] = useState(0);
  
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [logs, setLogs] = useState([]);
  const [motorIndex, setMotorIndex] = useState(0);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [webSerialSupported, setWebSerialSupported] = useState(true);
  
  // Refs
  const canvasRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const dataBufferRef = useRef('');
  const uptimeIntervalRef = useRef(null);

  const totalTasks = 3;

  // Check WebSerial support on mount
  useEffect(() => {
    if (!('serial' in navigator)) {
      setWebSerialSupported(false);
    }
    generateTasks();
    startCurrentTask();
  }, []);

  // Update canvas when angles change
  useEffect(() => {
    drawRobot();
    updateErrorDisplay();
  }, [currentAngles, targetAngles, currentTask]);

  // Uptime counter
  useEffect(() => {
    if (isConnected && connectionStartTime) {
      uptimeIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - connectionStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setUptime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        setUptime('00:00:00');
      }
    }

    return () => {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
    };
  }, [isConnected, connectionStartTime]);

  const generateTasks = useCallback(() => {
    const taskTypes = ['absolute', 'relative', 'absolute'];
    const newTasks = [];
    
    for (let i = 0; i < 3; i++) {
      const task = {
        type: taskTypes[i],
        targetAngles: generateRandomAngles(taskTypes[i]),
        initialAngles: i === 0 ? [0, 0, 0] : [...currentAngles]
      };
      newTasks.push(task);
    }
    setTasks(newTasks);
  }, [currentAngles]);

  const generateRandomAngles = (type) => {
    if (type === 'absolute') {
      return [
        Math.round((Math.random() * 300 - 150) / 5) * 5,
        Math.round((Math.random() * 180 - 90) / 5) * 5,
        Math.round((Math.random() * 180 - 90) / 5) * 5
      ];
    } else {
      return [
        Math.round((Math.random() * 120 - 60) / 5) * 5,
        Math.round((Math.random() * 120 - 60) / 5) * 5,
        Math.round((Math.random() * 120 - 60) / 5) * 5
      ];
    }
  };

  const logMessage = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      return updatedLogs.slice(-100);
    });
  }, []);

  const sendCommand = useCallback(async (command) => {
    if (!isConnected || !writerRef.current) {
      logMessage('Not connected to ESP32', 'error');
      return;
    }
    
    try {
      const data = new TextEncoder().encode(command + ';');
      await writerRef.current.write(data);
      logMessage(`Sent: ${command}`, 'info');
    } catch (error) {
      logMessage(`Send error: ${error.message}`, 'error');
    }
  }, [isConnected, logMessage]);

  const processSerialData = useCallback((data) => {
    logMessage(`Received: ${data}`, 'info');
    
    if (data.startsWith('REL_ANGLE:')) {
      const angleValue = parseFloat(data.substring(10));
      const angleDeg = angleValue * 180 / Math.PI;
      logMessage(`Relative angle: ${angleValue} rad (${angleDeg.toFixed(1)}°)`, 'info');
      
      setMotorIndex(prevIndex => {
        const newIndex = prevIndex < 3 ? prevIndex : 0;
        setCurrentAngles(prevAngles => {
          const newAngles = [...prevAngles];
          newAngles[newIndex] = angleDeg;
          return newAngles;
        });
        return newIndex + 1;
      });
    }
    
    // Handle other serial data types...
    if (data === 'PING_OK') {
      logMessage('Motor ping successful', 'success');
    }
    
    if (data === 'ESP32_DYNAMIXEL_CONTROLLER_READY') {
      logMessage('ESP32 controller is ready!', 'success');
    }
  }, [logMessage]);

  const readLoop = useCallback(async () => {
    try {
      while (port && port.readable && readerRef.current) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        dataBufferRef.current += text;
        
        const lines = dataBufferRef.current.split('\n');
        dataBufferRef.current = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            processSerialData(line.trim());
          }
        }
      }
    } catch (error) {
      if (isConnected) {
        logMessage(`Read error: ${error.message}`, 'error');
      }
    }
  }, [port, isConnected, processSerialData, logMessage]);

  const connect = async () => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      
      setPort(selectedPort);
      setIsConnected(true);
      setConnectionStartTime(Date.now());
      
      readerRef.current = selectedPort.readable.getReader();
      writerRef.current = selectedPort.writable.getWriter();
      
      logMessage('Connected to ESP32 successfully', 'success');
      readLoop();
      
    } catch (error) {
      logMessage(`Connection failed: ${error.message}`, 'error');
    }
  };

  const disconnect = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        await readerRef.current.releaseLock();
      }
      if (writerRef.current) {
        await writerRef.current.releaseLock();
      }
      if (port) {
        await port.close();
      }
      
      setPort(null);
      setIsConnected(false);
      setConnectionStartTime(null);
      readerRef.current = null;
      writerRef.current = null;
      
      logMessage('Disconnected from ESP32', 'warning');
      
    } catch (error) {
      logMessage(`Disconnect error: ${error.message}`, 'error');
    }
  };

  const startChallenge = async () => {
    if (!isConnected) {
      logMessage('Connect to ESP32 first!', 'error');
      return;
    }
    
    await sendCommand('DISABLE_TORQUE:1');
    await sendCommand('DISABLE_TORQUE:2');
    await sendCommand('DISABLE_TORQUE:3');
    
    setChallengeStarted(true);
    logMessage('Challenge started! Torque disabled - you can now manually move the robot joints.', 'success');
  };

  const completeTask = async () => {
    if (!isConnected) {
      logMessage('Connect to ESP32 first!', 'error');
      return;
    }
    
    logMessage('Reading final positions...', 'info');
    
    for (let id = 1; id <= 3; id++) {
      await sendCommand(`GET_REL_ANGLE:${id}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTimeout(() => {
      const task = tasks[currentTask];
      let actualTarget = [...task.targetAngles];
      
      if (task.type === 'relative') {
        actualTarget = task.initialAngles.map((initial, i) => initial + task.targetAngles[i]);
      }
      
      const taskErrors = actualTarget.map((target, i) => Math.abs(currentAngles[i] - target));
      const taskMaxError = Math.max(...taskErrors);
      const avgError = taskErrors.reduce((a, b) => a + b, 0) / taskErrors.length;
      
      let score = 100;
      if (taskMaxError > 5) score = Math.max(0, 100 - (taskMaxError - 5) * 10);
      else if (taskMaxError > 2) score = Math.max(90, 100 - (taskMaxError - 2) * 3);
      
      const result = {
        score: Math.round(score),
        maxError: taskMaxError.toFixed(1),
        avgError: avgError.toFixed(1),
        errors: taskErrors.map(e => e.toFixed(1))
      };
      
      setTaskResults(prev => [...prev, result]);
      setShowResults(true);
      
      logMessage(`Task ${currentTask + 1} completed! Score: ${result.score}/100`, 
                result.score >= 90 ? 'success' : result.score >= 70 ? 'info' : 'warning');
      
    }, 2000);
  };

  const startCurrentTask = useCallback(() => {
    if (tasks.length === 0) return;
    
    const task = tasks[currentTask];
    if (!task) return;
    
    setTargetAngles([...task.targetAngles]);
    setShowResults(false);
    setShowFinalResults(false);
    
    logMessage(`Started ${task.type} positioning task ${currentTask + 1}`, 'info');
  }, [tasks, currentTask, logMessage]);

  const updateErrorDisplay = useCallback(() => {
    if (tasks.length === 0 || !tasks[currentTask]) return;
    
    const task = tasks[currentTask];
    let actualTarget = [...task.targetAngles];
    
    if (task.type === 'relative') {
      actualTarget = task.initialAngles.map((initial, i) => initial + task.targetAngles[i]);
    }
    
    const newErrors = actualTarget.map((target, i) => Math.abs(currentAngles[i] - target));
    const newMaxError = Math.max(...newErrors);
    
    setErrors(newErrors);
    setMaxError(newMaxError);
  }, [tasks, currentTask, currentAngles]);

  const drawRobot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    const baseX = width / 2;
    const baseY = height - 80;
    const link1Length = Math.min(width, height) * 0.15;
    const link2Length = Math.min(width, height) * 0.12;
    const link3Length = Math.min(width, height) * 0.10;
    
    const angle1 = (currentAngles[0] * Math.PI) / 180;
    const angle2 = (currentAngles[1] * Math.PI) / 180;
    const angle3 = (currentAngles[2] * Math.PI) / 180;
    
    const joint1X = baseX + link1Length * Math.cos(angle1 - Math.PI/2);
    const joint1Y = baseY + link1Length * Math.sin(angle1 - Math.PI/2);
    
    const joint2X = joint1X + link2Length * Math.cos(angle1 + angle2 - Math.PI/2);
    const joint2Y = joint1Y + link2Length * Math.sin(angle1 + angle2 - Math.PI/2);
    
    const joint3X = joint2X + link3Length * Math.cos(angle1 + angle2 + angle3 - Math.PI/2);
    const joint3Y = joint2Y + link3Length * Math.sin(angle1 + angle2 + angle3 - Math.PI/2);
    
    // Draw links
    ctx.strokeStyle = '#0cc0df';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(joint1X, joint1Y);
    ctx.stroke();
    
    ctx.strokeStyle = '#007acc';
    ctx.beginPath();
    ctx.moveTo(joint1X, joint1Y);
    ctx.lineTo(joint2X, joint2Y);
    ctx.stroke();
    
    ctx.strokeStyle = '#ffd60a';
    ctx.beginPath();
    ctx.moveTo(joint2X, joint2Y);
    ctx.lineTo(joint3X, joint3Y);
    ctx.stroke();
    
    // Draw joints
    const jointPositions = [
      [baseX, baseY, '#ef4444'],
      [joint1X, joint1Y, '#f59e0b'],
      [joint2X, joint2Y, '#10b981'],
      [joint3X, joint3Y, '#8b5cf6']
    ];
    
    jointPositions.forEach(([x, y, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    ctx.fillStyle = '#374151';
    ctx.fillRect(baseX - 20, baseY, 40, 25);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`θ1: ${currentAngles[0].toFixed(1)}°`, 10, 25);
    ctx.fillText(`θ2: ${currentAngles[1].toFixed(1)}°`, 10, 45);
    ctx.fillText(`θ3: ${currentAngles[2].toFixed(1)}°`, 10, 65);
  }, [currentAngles]);

  const getErrorColor = (error) => {
    if (error <= 2) return '#059669';
    if (error <= 5) return '#d97706';
    return '#dc2626';
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#34d399';
      case 'warning': return '#fbbf24';
      case 'error': return '#f87171';
      default: return '#60a5fa';
    }
  };

  const nextTask = () => {
    const newTaskIndex = currentTask + 1;
    if (newTaskIndex >= totalTasks) {
      setShowFinalResults(true);
      setShowResults(false);
    } else {
      setCurrentTask(newTaskIndex);
      startCurrentTask();
    }
  };

  const clearLog = () => {
    setLogs([{ 
      id: Date.now(), 
      timestamp: new Date().toLocaleTimeString(), 
      message: 'Challenge 1 initialized. Connect to ESP32 to begin.', 
      type: 'info' 
    }]);
  };

  const currentTaskData = tasks[currentTask];

  return (
    <Box>
      {/* WebSerial Warning */}
      {!webSerialSupported && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>⚠️ WebSerial API not supported!</strong> 
          This interface requires a browser that supports WebSerial API (Chrome 89+, Edge 89+).
        </Alert>
      )}

      {/* Mission Background */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #0cc0df, #007acc)', 
        color: 'white' 
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>📖 Mission Background</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are a fresh recruit in the World Space Agency and you have been identified as the roboticist who can embark on space missions and program the onboard robot for various purposes during the mission.
          </Typography>
          <Typography variant="body1">
            <strong>Your Task:</strong> Connect to the ESP32 controller and manually move the robot joints to match the specified target angles. You'll work with both absolute and relative positioning to master robot control.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Connection Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: 'rgba(0, 8, 20, 0.9)',
            border: '1px solid rgba(12, 192, 223, 0.3)',
            borderRadius: '16px'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
                🔌 ESP32 Connection
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={isConnected ? <span>🟢</span> : <span>🔴</span>}
                    label={isConnected ? 'Connected' : 'Disconnected'}
                    color={isConnected ? 'success' : 'default'}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)">
                    Uptime: {uptime}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Usb />}
                    onClick={connect}
                    disabled={isConnected || !webSerialSupported}
                    sx={{ 
                      background: 'linear-gradient(45deg, #28a745, #20c997)',
                      '&:hover': { background: 'linear-gradient(45deg, #20c997, #28a745)' }
                    }}
                  >
                    Connect ESP32
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UsbOff />}
                    onClick={disconnect}
                    disabled={!isConnected}
                    color="error"
                  >
                    Disconnect
                  </Button>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
                🎯 Challenge Controls
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={startChallenge}
                  disabled={!isConnected || challengeStarted}
                  sx={{ 
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    '&:hover': { background: 'linear-gradient(45deg, #20c997, #28a745)' }
                  }}
                >
                  Start Challenge
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={completeTask}
                  disabled={!challengeStarted}
                  sx={{ 
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    '&:hover': { background: 'linear-gradient(45deg, #20c997, #28a745)' }
                  }}
                >
                  Complete Task
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Information Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: 'rgba(0, 8, 20, 0.9)',
            border: '1px solid rgba(12, 192, 223, 0.3)',
            borderRadius: '16px'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
                📋 Current Task
              </Typography>
              
              {currentTaskData && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(12, 192, 223, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(12, 192, 223, 0.3)',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ color: '#0cc0df', mb: 1 }}>
                    Task {currentTask + 1}: {currentTaskData.type === 'absolute' ? 'Absolute' : 'Relative'} Positioning
                  </Typography>
                  
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(255, 193, 7, 0.1)', 
                    borderRadius: 1, 
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    mb: 1
                  }}>
                    <Typography variant="body2" sx={{ color: '#ffc107', fontWeight: 'bold', mb: 0.5 }}>
                      🎯 Target Angles:
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ fontFamily: 'monospace' }}>
                      Joint 1: {targetAngles[0]}°, Joint 2: {targetAngles[1]}°, Joint 3: {targetAngles[2]}°
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: 1, 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    mb: 1
                  }}>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold', mb: 0.5 }}>
                      📏 Current Angles:
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ fontFamily: 'monospace' }}>
                      Joint 1: {currentAngles[0].toFixed(1)}°, Joint 2: {currentAngles[1].toFixed(1)}°, Joint 3: {currentAngles[2].toFixed(1)}°
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={((currentTask) / totalTasks) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #0cc0df, #007acc)'
                      }
                    }}
                  />
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.9)" sx={{ mt: 1 }}>
                    Task {currentTask + 1} of {totalTasks}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
                📊 Task Accuracy
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {errors.map((error, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>Joint {index + 1} Error:</span>
                    <span style={{ color: getErrorColor(error), fontWeight: 'bold' }}>
                      {error.toFixed(1)}°
                    </span>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontWeight: 'bold' }}>Max Error:</span>
                  <span style={{ color: getErrorColor(maxError), fontWeight: 'bold' }}>
                    {maxError.toFixed(1)}°
                  </span>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Robot Visualization */}
      <Card sx={{ 
        mt: 3, 
        bgcolor: 'rgba(0, 8, 20, 0.9)',
        border: '1px solid rgba(12, 192, 223, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
            🦾 Robot Arm Visualization
          </Typography>
          <Box sx={{ 
            width: '100%', 
            height: 400, 
            bgcolor: 'rgba(248, 250, 252, 0.05)', 
            border: '2px solid rgba(229, 231, 235, 0.1)', 
            borderRadius: 2,
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '8px'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Communication Log */}
      <Card sx={{ 
        mt: 3, 
        bgcolor: 'rgba(0, 8, 20, 0.9)',
        border: '1px solid rgba(12, 192, 223, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffd60a' }}>
              📡 Communication Log
            </Typography>
            <Button
              startIcon={<Clear />}
              onClick={clearLog}
              size="small"
              sx={{ color: 'rgba(168, 218, 220, 0.8)' }}
            >
              Clear Log
            </Button>
          </Box>
          <Box sx={{ 
            bgcolor: '#1f2937', 
            borderRadius: 1, 
            p: 2, 
            maxHeight: 300, 
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {logs.map((log) => (
              <Box key={log.id} sx={{ mb: 0.5, wordWrap: 'break-word' }}>
                <span style={{ color: '#9ca3af', fontWeight: 500 }}>
                  [{log.timestamp}]
                </span>{' '}
                <span style={{ color: getLogColor(log.type) }}>
                  {log.message}
                </span>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Task Results Dialog */}
      <Dialog
        open={showResults}
        onClose={() => setShowResults(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 8, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(12, 192, 223, 0.3)',
            borderRadius: '16px',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'rgba(12, 192, 223, 0.1)',
          borderBottom: '1px solid rgba(12, 192, 223, 0.3)'
        }}>
          <Typography variant="h5" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
            📊 Task {currentTask + 1} Results
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {taskResults[currentTask] && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: taskResults[currentTask].score >= 90 ? '#059669' : 
                           taskResults[currentTask].score >= 70 ? '#d97706' : '#dc2626'
                  }}
                >
                  {taskResults[currentTask].score}/100
                </Typography>
                <Typography variant="h6" color="rgba(168, 218, 220, 0.9)">
                  {taskResults[currentTask].score >= 90 ? '🎉 Excellent! Perfect positioning!' :
                   taskResults[currentTask].score >= 70 ? '👍 Good job! Close to target.' :
                   '📈 Keep practicing! Try to get closer to the target.'}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)">
                    Maximum Error
                  </Typography>
                  <Typography variant="h6" color="white">
                    {taskResults[currentTask].maxError}°
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)">
                    Average Error
                  </Typography>
                  <Typography variant="h6" color="white">
                    {taskResults[currentTask].avgError}°
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(12, 192, 223, 0.3)' }}>
          <Button 
            onClick={() => setShowResults(false)} 
            startIcon={<Refresh />}
            sx={{ color: 'rgba(168, 218, 220, 0.8)' }}
          >
            Retry Task
          </Button>
          {currentTask < totalTasks - 1 && (
            <Button
              variant="contained"
              onClick={nextTask}
              startIcon={<SkipNext />}
              sx={{ 
                background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                '&:hover': { background: 'linear-gradient(45deg, #007acc, #0cc0df)' }
              }}
            >
              Next Task
            </Button>
          )}
          {currentTask === totalTasks - 1 && (
            <Button
              variant="contained"
              onClick={() => setShowFinalResults(true)}
              startIcon={<CheckCircle />}
              sx={{ 
                background: 'linear-gradient(45deg, #28a745, #20c997)',
                '&:hover': { background: 'linear-gradient(45deg, #20c997, #28a745)' }
              }}
            >
              View Final Results
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Final Results Dialog */}
      <Dialog
        open={showFinalResults}
        onClose={() => setShowFinalResults(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 8, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(12, 192, 223, 0.3)',
            borderRadius: '16px',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'rgba(12, 192, 223, 0.1)',
          borderBottom: '1px solid rgba(12, 192, 223, 0.3)'
        }}>
          <Typography variant="h5" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
            🏆 Challenge Complete!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {taskResults.length > 0 && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {(() => {
                  const totalScore = taskResults.reduce((sum, result) => sum + result.score, 0);
                  const avgScore = Math.round(totalScore / totalTasks);
                  return (
                    <>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: avgScore >= 90 ? '#059669' : avgScore >= 70 ? '#d97706' : '#dc2626'
                        }}
                      >
                        {totalScore}/{totalTasks * 100}
                      </Typography>
                      <Typography variant="h6" color="rgba(168, 218, 220, 0.9)">
                        {avgScore >= 90 ? '🚀 Outstanding! You\'re ready for space missions!' :
                         avgScore >= 70 ? '⭐ Well done! Good robot control skills.' :
                         '📚 Keep practicing! Robot control takes time to master.'}
                      </Typography>
                    </>
                  );
                })()}
              </Box>
              
              <Typography variant="h6" sx={{ color: '#ffd60a', mb: 2 }}>
                Task Breakdown:
              </Typography>
              {taskResults.map((result, i) => (
                <Box key={i} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="body1" color="white" fontWeight="bold">
                        Task {i + 1}:
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h6" sx={{ 
                        color: result.score >= 90 ? '#059669' : result.score >= 70 ? '#d97706' : '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        {result.score}/100
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="rgba(168, 218, 220, 0.8)">
                        Max Error: {result.maxError}°
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(12, 192, 223, 0.3)' }}>
          <Button
            variant="contained"
            onClick={() => {
              setCurrentTask(0);
              setTaskResults([]);
              setChallengeStarted(false);
              setShowFinalResults(false);
              generateTasks();
            }}
            startIcon={<RestartAlt />}
            sx={{ 
              background: 'linear-gradient(45deg, #0cc0df, #007acc)',
              '&:hover': { background: 'linear-gradient(45deg, #007acc, #0cc0df)' }
            }}
          >
            Restart Challenge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Challenge1;