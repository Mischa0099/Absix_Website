// src/hooks/useRobot.js
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  connectRobot, 
  disconnectRobot,
  moveJoint,
  moveToPosition,
  emergencyStop,
  calibrateRobot,
  executeCode,
  setRobotData,
  addError,
  clearErrors,
  addWarning,
  clearWarnings,
  selectIsConnected,
  selectConnectionStatus,
  selectTelemetry,
  selectRobotErrors,
  selectRobotWarnings,
  selectExecutionState,
  selectSafetyState,
  selectCalibrationState,
  selectRobotConfig,
  selectLoadingState
} from '../store/robotSlice';
import websocketService from '../services/websocketService';
import robotService from '../services/robotService';

export const useRobot = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const connected = useSelector(selectIsConnected);
  const connectionStatus = useSelector(selectConnectionStatus);
  const telemetry = useSelector(selectTelemetry);
  const errors = useSelector(selectRobotErrors);
  const warnings = useSelector(selectRobotWarnings);
  const executionState = useSelector(selectExecutionState);
  const safetyState = useSelector(selectSafetyState);
  const calibrationState = useSelector(selectCalibrationState);
  const robotConfig = useSelector(selectRobotConfig);
  const loading = useSelector(selectLoadingState);

  // Computed values
  const jointAngles = telemetry?.joint_angles || [0, 0, 0];
  const jointVelocities = telemetry?.joint_velocities || [0, 0, 0];
  const jointTemperatures = telemetry?.joint_temperatures || [25, 25, 25];
  const jointCurrents = telemetry?.joint_currents || [0, 0, 0];
  const isExecuting = executionState?.isExecuting || false;
  const isCalibrated = calibrationState?.isCalibrated || false;
  const error = errors?.[errors.length - 1]?.message || null;

  // Connection methods
  const connect = useCallback(async () => {
    try {
      await dispatch(connectRobot()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to connect robot:', error);
      return false;
    }
  }, [dispatch]);

  const disconnect = useCallback(async () => {
    try {
      await dispatch(disconnectRobot()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to disconnect robot:', error);
      return false;
    }
  }, [dispatch]);

  // Movement methods
  const moveJointToPosition = useCallback(async (jointId, position) => {
    try {
      await dispatch(moveJoint({ jointId, position })).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to move joint:', error);
      return false;
    }
  }, [dispatch]);

  const moveToTargetPosition = useCallback(async (positions) => {
    try {
      await dispatch(moveToPosition(positions)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to move to position:', error);
      return false;
    }
  }, [dispatch]);

  const setJointAngles = useCallback(async (angles) => {
    try {
      // Convert angles to appropriate format and send command
      const command = connected && websocketService.isConnected() 
        ? websocketService.sendRobotCommand('set_joint_angles', { angles })
        : await robotService.setJointAngles(angles);
      
      if (command !== false) {
        // Update local state optimistically
        dispatch(setRobotData({ joint_angles: angles }));
        return true;
      }
      return false;
    } catch (error) {
      dispatch(addError({ message: `Failed to set joint angles: ${error.message}` }));
      return false;
    }
  }, [dispatch, connected]);

  const getJointAngles = useCallback(async () => {
    try {
      if (connected && websocketService.isConnected()) {
        // Return current telemetry data
        return jointAngles;
      } else {
        // Fetch from API
        const response = await robotService.getJointAngles();
        return response.data?.joint_angles || jointAngles;
      }
    } catch (error) {
      dispatch(addError({ message: `Failed to get joint angles: ${error.message}` }));
      return jointAngles; // Return cached data as fallback
    }
  }, [dispatch, connected, jointAngles]);

  // Torque control
  const enableTorque = useCallback(async (actuatorId) => {
    try {
      const command = connected && websocketService.isConnected()
        ? websocketService.sendRobotCommand('enable_torque', { actuator_id: actuatorId })
        : await robotService.enableTorque(actuatorId);
      
      return command !== false;
    } catch (error) {
      dispatch(addError({ message: `Failed to enable torque: ${error.message}` }));
      return false;
    }
  }, [dispatch, connected]);

  const disableTorque = useCallback(async (actuatorId) => {
    try {
      const command = connected && websocketService.isConnected()
        ? websocketService.sendRobotCommand('disable_torque', { actuator_id: actuatorId })
        : await robotService.disableTorque(actuatorId);
      
      return command !== false;
    } catch (error) {
      dispatch(addError({ message: `Failed to disable torque: ${error.message}` }));
      return false;
    }
  }, [dispatch, connected]);

  // Safety methods
  const triggerEmergencyStop = useCallback(async () => {
    try {
      await dispatch(emergencyStop()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to trigger emergency stop:', error);
      return false;
    }
  }, [dispatch]);

  // Calibration
  const calibrate = useCallback(async () => {
    try {
      await dispatch(calibrateRobot()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to calibrate robot:', error);
      return false;
    }
  }, [dispatch]);

  // Code execution
  const executeRobotCode = useCallback(async (code) => {
    try {
      await dispatch(executeCode(code)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to execute code:', error);
      return false;
    }
  }, [dispatch]);

  // Error handling
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearWarning = useCallback(() => {
    dispatch(clearWarnings());
  }, [dispatch]);

  // State update methods
  const updateRobotState = useCallback((newState) => {
    dispatch(setRobotData(newState));
  }, [dispatch]);

  // Send generic command
  const sendCommand = useCallback(async (command, parameters = {}) => {
    try {
      if (connected && websocketService.isConnected()) {
        return websocketService.sendRobotCommand(command, parameters);
      } else {
        // Fallback to HTTP API
        const response = await robotService.sendCommand(command, parameters);
        return response.data;
      }
    } catch (error) {
      dispatch(addError({ message: `Command failed: ${error.message}` }));
      return false;
    }
  }, [dispatch, connected]);

  // Hardware status (mock data for compatibility)
  const hardware = {
    actuators: [
      { id: 1, enabled: true, position: jointAngles[0] || 0, current: jointCurrents[0] || 0, temperature: jointTemperatures[0] || 25 },
      { id: 2, enabled: true, position: jointAngles[1] || 0, current: jointCurrents[1] || 0, temperature: jointTemperatures[1] || 25 },
      { id: 3, enabled: true, position: jointAngles[2] || 0, current: jointCurrents[2] || 0, temperature: jointTemperatures[2] || 25 }
    ],
    connected: connected,
    status: connectionStatus
  };

  return {
    // Connection state
    connected,
    connectionStatus,
    loading,
    
    // Robot data
    jointAngles,
    jointVelocities,
    jointTemperatures,
    jointCurrents,
    telemetry,
    hardware,
    
    // Execution state
    isExecuting,
    executionState,
    
    // Safety and calibration
    safetyState,
    isCalibrated,
    calibrationState,
    robotConfig,
    
    // Errors and warnings
    error,
    errors,
    warnings,
    
    // Connection methods
    connect,
    disconnect,
    
    // Movement methods
    moveJoint: moveJointToPosition,
    moveToPosition: moveToTargetPosition,
    setJointAngles,
    getJointAngles,
    
    // Torque control
    enableTorque,
    disableTorque,
    
    // Safety methods
    emergencyStop: triggerEmergencyStop,
    
    // Calibration
    calibrate,
    
    // Code execution
    executeCode: executeRobotCode,
    
    // Error handling
    clearError,
    clearWarning,
    
    // State management
    updateState: updateRobotState,
    sendCommand,
    
    // Utility methods
    isConnected: () => connected,
    getStatus: () => ({
      connected,
      status: connectionStatus,
      executing: isExecuting,
      calibrated: isCalibrated,
      errors: errors.length,
      warnings: warnings.length
    })
  };
};