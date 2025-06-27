// src/hooks/useWebSocketService.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRobotData, 
  setConnectionStatus, 
  setExecutionState, 
  addError, 
  addWarning,
  updatePerformanceMetrics 
} from '../store/robotSlice';
import { performanceMonitor } from '../utils/performanceMonitor';

// WebSocket configuration
const DEFAULT_CONFIG = {
  url: process.env.REACT_APP_HARDWARE_BRIDGE_URL || 'ws://localhost:8001',
  protocols: ['robot-control'],
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  heartbeatTimeout: 5000,
  messageTimeout: 10000
};

// Message types
const MESSAGE_TYPES = {
  // Outgoing
  EXECUTE_CODE: 'execute_code',
  REQUEST_TELEMETRY: 'request_telemetry',
  REQUEST_POSITION: 'request_position',
  MOVE_JOINT: 'move_joint',
  MOVE_TO_POSITION: 'move_to_position',
  EMERGENCY_STOP: 'emergency_stop',
  CALIBRATE: 'start_calibration',
  RESET_HOME: 'reset_to_home',
  HEARTBEAT: 'heartbeat',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  
  // Incoming
  ROBOT_TELEMETRY: 'robot_telemetry',
  EXECUTION_RESULT: 'execution_result',
  EXECUTION_PROGRESS: 'execution_progress',
  ROBOT_STATUS: 'robot_status',
  ERROR: 'error',
  HEARTBEAT_RESPONSE: 'heartbeat_response',
  CONNECTION_STATUS: 'connection_status'
};

export const useWebSocketService = (config = {}) => {
  const dispatch = useDispatch();
  const { isConnected } = useSelector(state => state.robot);
  
  // State
  const [connectionState, setConnectionState] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [lastError, setLastError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [messageQueue, setMessageQueue] = useState([]);
  const [subscriptions, setSubscriptions] = useState(new Set(['robot_telemetry', 'robot_status']));
  
  // Refs
  const wsRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const heartbeatTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageTimeoutsRef = useRef(new Map());
  
  // Configuration
  const wsConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Performance tracking
  const [stats, setStats] = useState({
    messagesReceived: 0,
    messagesSent: 0,
    averageLatency: 0,
    connectionUptime: 0,
    lastActivity: null
  });

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Send message with tracking
  const sendMessage = useCallback((message, options = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (options.queue !== false) {
        setMessageQueue(prev => [...prev, { message, options, timestamp: Date.now() }]);
      }
      return false;
    }

    try {
      const messageWithId = {
        ...message,
        messageId: generateMessageId(),
        timestamp: new Date().toISOString()
      };

      const messageString = JSON.stringify(messageWithId);
      wsRef.current.send(messageString);

      // Update stats
      setStats(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1,
        lastActivity: new Date().toISOString()
      }));

      // Set timeout for response if expected
      if (options.expectResponse && options.timeout) {
        const timeoutId = setTimeout(() => {
          dispatch(addWarning({
            message: `Message timeout: ${message.type}`,
            type: 'websocket_timeout'
          }));
          messageTimeoutsRef.current.delete(messageWithId.messageId);
        }, options.timeout);

        messageTimeoutsRef.current.set(messageWithId.messageId, timeoutId);
      }

      // Performance monitoring
      if (message.type === MESSAGE_TYPES.REQUEST_TELEMETRY) {
        performanceMonitor.monitorTelemetryLatency(Date.now());
      }

      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      dispatch(addError({
        message: `Failed to send message: ${error.message}`,
        type: 'websocket_send_error'
      }));
      return false;
    }
  }, [dispatch, generateMessageId]);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, payload, messageId, timestamp } = message;

      // Update stats
      setStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
        lastActivity: new Date().toISOString()
      }));

      // Clear message timeout if this is a response
      if (messageId && messageTimeoutsRef.current.has(messageId)) {
        clearTimeout(messageTimeoutsRef.current.get(messageId));
        messageTimeoutsRef.current.delete(messageId);
      }

      // Handle specific message types
      switch (type) {
        case MESSAGE_TYPES.ROBOT_TELEMETRY:
          handleTelemetryMessage(payload);
          break;

        case MESSAGE_TYPES.EXECUTION_RESULT:
          handleExecutionResult(payload);
          break;

        case MESSAGE_TYPES.EXECUTION_PROGRESS:
          handleExecutionProgress(payload);
          break;

        case MESSAGE_TYPES.ROBOT_STATUS:
          handleRobotStatus(payload);
          break;

        case MESSAGE_TYPES.ERROR:
          handleErrorMessage(payload);
          break;

        case MESSAGE_TYPES.HEARTBEAT_RESPONSE:
          handleHeartbeatResponse();
          break;

        case MESSAGE_TYPES.CONNECTION_STATUS:
          handleConnectionStatus(payload);
          break;

        default:
          console.log('Unknown WebSocket message type:', type);
      }

      // Performance monitoring
      if (type === MESSAGE_TYPES.ROBOT_TELEMETRY && timestamp) {
        const latency = Date.now() - new Date(timestamp).getTime();
        setStats(prev => ({
          ...prev,
          averageLatency: (prev.averageLatency * 0.9) + (latency * 0.1) // Moving average
        }));
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      dispatch(addError({
        message: `Failed to parse message: ${error.message}`,
        type: 'websocket_parse_error'
      }));
    }
  }, [dispatch]);

  // Message handlers
  const handleTelemetryMessage = useCallback((telemetry) => {
    dispatch(setRobotData({
      joint_angles: telemetry.joint_angles || [0, 0, 0],
      joint_velocities: telemetry.joint_velocities || [0, 0, 0],
      joint_currents: telemetry.joint_currents || [0, 0, 0],
      joint_temperatures: telemetry.joint_temperatures || [25, 25, 25],
      joint_torques: telemetry.joint_torques || [0, 0, 0],
      end_effector_position: telemetry.end_effector_position || { x: 0, y: 0, z: 0 },
      end_effector_velocity: telemetry.end_effector_velocity || { x: 0, y: 0, z: 0 },
      system_status: telemetry.system_status || 'idle',
      timestamp: telemetry.timestamp || new Date().toISOString(),
      updateRate: telemetry.update_rate || 0
    }));
  }, [dispatch]);

  const handleExecutionResult = useCallback((result) => {
    dispatch(setExecutionState({
      isExecuting: false,
      executionEndTime: new Date().toISOString(),
      lastExecution: {
        success: result.success,
        result,
        timestamp: new Date().toISOString()
      }
    }));

    if (result.success) {
      dispatch(addWarning({
        message: 'Code execution completed successfully',
        type: 'execution_success'
      }));
    } else {
      dispatch(addError({
        message: `Code execution failed: ${result.error || 'Unknown error'}`,
        type: 'execution_error'
      }));
    }
  }, [dispatch]);

  const handleExecutionProgress = useCallback((progress) => {
    dispatch(setExecutionState({
      executionProgress: progress
    }));
  }, [dispatch]);

  const handleRobotStatus = useCallback((status) => {
    if (status.connected !== undefined) {
      dispatch(setConnectionStatus(status.connected ? 'connected' : 'disconnected'));
    }

    if (status.errors && status.errors.length > 0) {
      status.errors.forEach(error => {
        dispatch(addError({
          message: error.message || error,
          type: 'robot_error',
          context: error
        }));
      });
    }

    if (status.warnings && status.warnings.length > 0) {
      status.warnings.forEach(warning => {
        dispatch(addWarning({
          message: warning.message || warning,
          type: 'robot_warning',
          context: warning
        }));
      });
    }
  }, [dispatch]);

  const handleErrorMessage = useCallback((error) => {
    dispatch(addError({
      message: error.message || 'Unknown WebSocket error',
      type: 'websocket_error',
      context: error
    }));
  }, [dispatch]);

  const handleHeartbeatResponse = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const handleConnectionStatus = useCallback((status) => {
    console.log('Connection status update:', status);
  }, []);

  // Start heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({
          type: MESSAGE_TYPES.HEARTBEAT
        });

        // Set timeout for heartbeat response
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn('Heartbeat timeout - connection may be lost');
          dispatch(addWarning({
            message: 'Heartbeat timeout - connection may be unstable',
            type: 'connection_warning'
          }));
        }, wsConfig.heartbeatTimeout);
      }
    }, wsConfig.heartbeatInterval);
  }, [sendMessage, dispatch, wsConfig]);

  // Stop heartbeat mechanism
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    if (messageQueue.length === 0) return;

    const messagesToSend = [...messageQueue];
    setMessageQueue([]);

    messagesToSend.forEach(({ message, options }) => {
      sendMessage(message, options);
    });
  }, [messageQueue, sendMessage]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionState('connecting');
    setLastError(null);

    try {
      wsRef.current = new WebSocket(wsConfig.url, wsConfig.protocols);

      wsRef.current.onopen = (event) => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        setReconnectAttempts(0);
        setLastError(null);

        // Start heartbeat
        startHeartbeat();

        // Subscribe to default message types
        sendMessage({
          type: MESSAGE_TYPES.SUBSCRIBE,
          payload: { messageTypes: Array.from(subscriptions) }
        });

        // Process queued messages
        processMessageQueue();

        // Update performance stats
        setStats(prev => ({
          ...prev,
          connectionUptime: Date.now()
        }));

        dispatch(setConnectionStatus('connected'));
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnectionState('disconnected');
        
        // Stop heartbeat
        stopHeartbeat();

        dispatch(setConnectionStatus('disconnected'));

        // Schedule reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts < wsConfig.maxReconnectAttempts) {
          scheduleReconnect();
        } else if (reconnectAttempts >= wsConfig.maxReconnectAttempts) {
          setLastError('Maximum reconnection attempts reached');
          dispatch(addError({
            message: 'WebSocket connection failed after maximum retry attempts',
            type: 'connection_failed'
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        setLastError('WebSocket connection error');

        dispatch(addError({
          message: 'WebSocket connection error occurred',
          type: 'websocket_error'
        }));
      };

      wsRef.current.onmessage = handleMessage;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
      setLastError(error.message);

      dispatch(addError({
        message: `Failed to create WebSocket connection: ${error.message}`,
        type: 'websocket_creation_error'
      }));
    }
  }, [wsConfig, reconnectAttempts, subscriptions, sendMessage, processMessageQueue, startHeartbeat, stopHeartbeat, handleMessage, dispatch]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      stopHeartbeat();
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setConnectionState('disconnected');
    setReconnectAttempts(0);
    setLastError(null);

    // Clear message queue
    setMessageQueue([]);

    // Clear message timeouts
    messageTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    messageTimeoutsRef.current.clear();

    dispatch(setConnectionStatus('disconnected'));
  }, [stopHeartbeat, dispatch]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    const attempts = reconnectAttempts + 1;
    setReconnectAttempts(attempts);

    const delay = Math.min(wsConfig.reconnectInterval * Math.pow(2, attempts - 1), 30000);

    console.log(`Scheduling reconnection attempt ${attempts}/${wsConfig.maxReconnectAttempts} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [reconnectAttempts, wsConfig, connect]);

  // Public API methods
  const api = {
    // Connection methods
    connect,
    disconnect,
    
    // Robot control methods
    executeCode: (code, options = {}) => 
      sendMessage({
        type: MESSAGE_TYPES.EXECUTE_CODE,
        payload: { code, language: 'python', options }
      }, { expectResponse: true, timeout: 30000 }),
    
    requestTelemetry: () => 
      sendMessage({ type: MESSAGE_TYPES.REQUEST_TELEMETRY }),
    
    requestPosition: () => 
      sendMessage({ type: MESSAGE_TYPES.REQUEST_POSITION }),
    
    moveJoint: (jointId, angle, options = {}) => 
      sendMessage({
        type: MESSAGE_TYPES.MOVE_JOINT,
        payload: { jointId, angle, ...options }
      }),
    
    moveToPosition: (targetAngles, options = {}) => 
      sendMessage({
        type: MESSAGE_TYPES.MOVE_TO_POSITION,
        payload: { targetAngles, ...options }
      }),
    
    emergencyStop: () => 
      sendMessage({ type: MESSAGE_TYPES.EMERGENCY_STOP }),
    
    startCalibration: (options = {}) => 
      sendMessage({
        type: MESSAGE_TYPES.CALIBRATE,
        payload: options
      }),
    
    resetToHome: () => 
      sendMessage({ type: MESSAGE_TYPES.RESET_HOME }),
    
    // Subscription methods
    subscribe: (messageTypes) => {
      setSubscriptions(prev => new Set([...prev, ...messageTypes]));
      sendMessage({
        type: MESSAGE_TYPES.SUBSCRIBE,
        payload: { messageTypes }
      });
    },
    
    unsubscribe: (messageTypes) => {
      setSubscriptions(prev => {
        const newSubs = new Set(prev);
        messageTypes.forEach(type => newSubs.delete(type));
        return newSubs;
      });
      sendMessage({
        type: MESSAGE_TYPES.UNSUBSCRIBE,
        payload: { messageTypes }
      });
    },
    
    // Utility methods
    sendMessage,
    getConnectionState: () => connectionState,
    getStats: () => stats,
    isConnected: () => connectionState === 'connected'
  };

  // Auto-connect on mount if robot is connected
  useEffect(() => {
    if (isConnected && connectionState === 'disconnected') {
      connect();
    }
  }, [isConnected, connectionState, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [disconnect]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionState === 'connected') {
        dispatch(updatePerformanceMetrics({
          websocketStats: {
            messagesReceived: stats.messagesReceived,
            messagesSent: stats.messagesSent,
            averageLatency: stats.averageLatency,
            connectionUptime: stats.connectionUptime ? Date.now() - stats.connectionUptime : 0,
            lastActivity: stats.lastActivity
          }
        }));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [connectionState, stats, dispatch]);

  return {
    // State
    connectionState,
    isConnected: connectionState === 'connected',
    lastError,
    reconnectAttempts,
    messageQueue: messageQueue.length,
    stats,
    
    // API
    ...api
  };
};