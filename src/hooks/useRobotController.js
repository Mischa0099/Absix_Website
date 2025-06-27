import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { robotService } from '../services/robotService';
import { websocketService } from '../services/websocketService';
import { setRobotData, setConnectionStatus, setExecutionState } from '../store/robotSlice';

export const useRobotController = () => {
  const dispatch = useDispatch();
  const { robot, isConnected } = useSelector(state => state.robot);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [error, setError] = useState(null);
  const [telemetryData, setTelemetryData] = useState(null);
  
  // WebSocket connection for real-time updates
  const wsRef = useRef(null);
  const telemetryIntervalRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isConnected && !wsRef.current) {
      initializeWebSocket();
    }
    
    return () => {
      cleanupWebSocket();
    };
  }, [isConnected]);

  const initializeWebSocket = useCallback(() => {
    try {
      wsRef.current = websocketService.connect({
        onMessage: handleWebSocketMessage,
        onError: handleWebSocketError,
        onClose: handleWebSocketClose,
        onOpen: handleWebSocketOpen
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setError('WebSocket connection failed');
    }
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      websocketService.disconnect();
      wsRef.current = null;
    }
    
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
  }, []);

  // WebSocket event handlers
  const handleWebSocketOpen = useCallback(() => {
    console.log('Robot WebSocket connected');
    startTelemetryUpdates();
  }, []);

  const handleWebSocketClose = useCallback(() => {
    console.log('Robot WebSocket disconnected');
    dispatch(setConnectionStatus(false));
    cleanupWebSocket();
  }, [dispatch]);

  const handleWebSocketError = useCallback((error) => {
    console.error('Robot WebSocket error:', error);
    setError('Real-time communication error');
  }, []);

  const handleWebSocketMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'robot_telemetry':
          handleTelemetryUpdate(data.payload);
          break;
          
        case 'execution_result':
          handleExecutionResult(data.payload);
          break;
          
        case 'execution_progress':
          handleExecutionProgress(data.payload);
          break;
          
        case 'error':
          handleExecutionError(data.payload);
          break;
          
        case 'robot_status':
          handleRobotStatusUpdate(data.payload);
          break;
          
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  // Handle real-time telemetry updates
  const handleTelemetryUpdate = useCallback((telemetry) => {
    const robotData = {
      joint_angles: telemetry.joint_angles || [0, 0, 0],
      joint_velocities: telemetry.joint_velocities || [0, 0, 0],
      joint_currents: telemetry.joint_currents || [0, 0, 0],
      joint_temperatures: telemetry.joint_temperatures || [25, 25, 25],
      end_effector_position: telemetry.end_effector_position || { x: 0, y: 0, z: 0 },
      system_status: telemetry.system_status || 'operational',
      timestamp: telemetry.timestamp || new Date().toISOString()
    };
    
    dispatch(setRobotData(robotData));
    setTelemetryData(robotData);
  }, [dispatch]);

  // Handle code execution results
  const handleExecutionResult = useCallback((result) => {
    setIsExecuting(false);
    setExecutionResults(result);
    
    dispatch(setExecutionState({
      isExecuting: false,
      lastExecution: {
        success: result.success,
        timestamp: new Date().toISOString(),
        error: result.error,
        metrics: result.metrics
      }
    }));
  }, [dispatch]);

  // Handle execution progress updates
  const handleExecutionProgress = useCallback((progress) => {
    dispatch(setExecutionState({
      isExecuting: true,
      executionProgress: progress
    }));
  }, [dispatch]);

  // Handle execution errors
  const handleExecutionError = useCallback((error) => {
    setIsExecuting(false);
    setError(error.message || 'Execution failed');
    
    dispatch(setExecutionState({
      isExecuting: false,
      lastExecution: {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }));
  }, [dispatch]);

  // Handle robot status updates
  const handleRobotStatusUpdate = useCallback((status) => {
    if (!status.connected) {
      dispatch(setConnectionStatus(false));
    }
  }, [dispatch]);

  // Start periodic telemetry updates
  const startTelemetryUpdates = useCallback(() => {
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
    }
    
    telemetryIntervalRef.current = setInterval(async () => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'request_telemetry',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Failed to request telemetry:', error);
      }
    }, 100); // 10Hz update rate
  }, []);

  // Execute Python code
  const executeCode = useCallback(async (code, options = {}) => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }
    
    if (isExecuting) {
      throw new Error('Code execution already in progress');
    }

    setIsExecuting(true);
    setError(null);
    setExecutionResults(null);

    try {
      // Send execution request via WebSocket for real-time updates
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'execute_code',
          payload: {
            code,
            language: 'python',
            options: {
              challengeId: options.challengeId,
              targetPosition: options.targetPosition,
              safetyEnabled: options.safetyEnabled !== false,
              maxExecutionTime: options.maxExecutionTime || 30000, // 30 seconds default
              ...options
            },
            timestamp: new Date().toISOString()
          }
        }));

        // Return a promise that resolves when execution completes
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            setIsExecuting(false);
            reject(new Error('Code execution timeout'));
          }, options.maxExecutionTime || 30000);

          const checkResult = () => {
            if (executionResults) {
              clearTimeout(timeout);
              resolve(executionResults);
            } else if (!isExecuting && error) {
              clearTimeout(timeout);
              reject(new Error(error));
            } else if (isExecuting) {
              setTimeout(checkResult, 100);
            }
          };

          checkResult();
        });
      } else {
        // Fallback to HTTP API if WebSocket not available
        const result = await robotService.executeCode(code, options);
        setIsExecuting(false);
        setExecutionResults(result);
        return result;
      }
    } catch (error) {
      setIsExecuting(false);
      setError(error.message);
      throw error;
    }
  }, [isConnected, isExecuting, executionResults, error]);

  // Measure current robot position
  const measurePosition = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }

    try {
      const position = await robotService.getCurrentPosition();
      
      // Also request via WebSocket for real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'request_position',
          timestamp: new Date().toISOString()
        }));
      }
      
      return position;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [isConnected]);

  // Move individual joint
  const moveJoint = useCallback(async (jointId, angle, options = {}) => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }

    try {
      const result = await robotService.moveJoint(jointId, angle, options);
      
      // Send via WebSocket for real-time tracking
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'move_joint',
          payload: {
            jointId,
            angle,
            speed: options.speed || 50,
            acceleration: options.acceleration || 50
          },
          timestamp: new Date().toISOString()
        }));
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [isConnected]);

  // Move to target position
  const moveToPosition = useCallback(async (targetAngles, options = {}) => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }

    try {
      const result = await robotService.moveToPosition(targetAngles, options);
      
      // Send via WebSocket for real-time tracking
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'move_to_position',
          payload: {
            targetAngles,
            speed: options.speed || 50,
            acceleration: options.acceleration || 50,
            trajectory: options.trajectory || 'linear'
          },
          timestamp: new Date().toISOString()
        }));
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [isConnected]);

  // Emergency stop
  const emergencyStop = useCallback(async () => {
    try {
      // Send emergency stop via both WebSocket and HTTP for redundancy
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'emergency_stop',
          timestamp: new Date().toISOString()
        }));
      }
      
      const result = await robotService.emergencyStop();
      
      setIsExecuting(false);
      setError(null);
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Connect to robot
  const connect = useCallback(async () => {
    try {
      const result = await robotService.connect();
      
      if (result.success) {
        dispatch(setConnectionStatus(true));
        initializeWebSocket();
      } else {
        throw new Error(result.error || 'Connection failed');
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [dispatch, initializeWebSocket]);

  // Disconnect from robot
  const disconnect = useCallback(async () => {
    try {
      cleanupWebSocket();
      const result = await robotService.disconnect();
      dispatch(setConnectionStatus(false));
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [dispatch, cleanupWebSocket]);

  // Get robot status
  const getRobotStatus = useCallback(async () => {
    try {
      const status = await robotService.getStatus();
      return status;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Calibrate robot
  const calibrate = useCallback(async (options = {}) => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }

    try {
      const result = await robotService.calibrate(options);
      
      // Send via WebSocket for real-time updates
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_calibration',
          payload: options,
          timestamp: new Date().toISOString()
        }));
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [isConnected]);

  // Reset robot to home position
  const resetToHome = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Robot not connected');
    }

    try {
      const result = await robotService.resetToHome();
      
      // Send via WebSocket for real-time tracking
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'reset_to_home',
          timestamp: new Date().toISOString()
        }));
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [isConnected]);

  // Calculate forward kinematics
  const calculateForwardKinematics = useCallback((jointAngles) => {
    try {
      // Robot link lengths (in pixels for visualization)
      const L1 = 140, L2 = 120, L3 = 100;
      
      const [θ1, θ2, θ3] = jointAngles.map(angle => angle * Math.PI / 180);
      
      // Calculate joint positions
      const positions = [
        { x: 0, y: 0 }, // Base
        { 
          x: L1 * Math.cos(θ1), 
          y: L1 * Math.sin(θ1) 
        }, // Joint 1
        { 
          x: L1 * Math.cos(θ1) + L2 * Math.cos(θ1 + θ2),
          y: L1 * Math.sin(θ1) + L2 * Math.sin(θ1 + θ2)
        }, // Joint 2
        { 
          x: L1 * Math.cos(θ1) + L2 * Math.cos(θ1 + θ2) + L3 * Math.cos(θ1 + θ2 + θ3),
          y: L1 * Math.sin(θ1) + L2 * Math.sin(θ1 + θ2) + L3 * Math.sin(θ1 + θ2 + θ3)
        } // End effector
      ];
      
      return positions;
    } catch (error) {
      console.error('Forward kinematics calculation error:', error);
      return [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    }
  }, []);

  // Calculate position error
  const calculatePositionError = useCallback((currentAngles, targetAngles) => {
    if (!currentAngles || !targetAngles) return 0;
    
    const errors = currentAngles.map((angle, i) => 
      Math.abs(angle - (targetAngles[i] || 0))
    );
    
    return Math.max(...errors);
  }, []);

  // Get workspace boundaries
  const getWorkspaceBoundaries = useCallback(() => {
    const L1 = 140, L2 = 120, L3 = 100;
    
    return {
      maxReach: L1 + L2 + L3,
      minReach: Math.max(0, Math.abs(L1 - L2 - L3)),
      jointLimits: [
        { min: -150, max: 150 }, // Joint 1
        { min: -120, max: 120 }, // Joint 2
        { min: -90, max: 90 }    // Joint 3
      ]
    };
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear execution results
  const clearExecutionResults = useCallback(() => {
    setExecutionResults(null);
  }, []);

  return {
    // State
    isConnected,
    isExecuting,
    error,
    executionResults,
    telemetryData,
    robotData: robot,

    // Control functions
    executeCode,
    measurePosition,
    moveJoint,
    moveToPosition,
    emergencyStop,
    connect,
    disconnect,
    getRobotStatus,
    calibrate,
    resetToHome,

    // Utility functions
    calculateForwardKinematics,
    calculatePositionError,
    getWorkspaceBoundaries,
    clearError,
    clearExecutionResults
  };
};