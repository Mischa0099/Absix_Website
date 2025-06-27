// frontend/src/hooks/useSafeRobotData.js
import { useSelector } from 'react-redux';
import { 
  selectRobotConnected,
  selectRobotConnectionStatus,
  selectRobotJointAngles,
  selectRobotJointPositions,
  selectRobotJointVelocities,
  selectRobotActuators,
  selectRobotActuatorList,
  selectRobotSafetyStatus,
  selectBridgeStatus,
  selectRobotError,
  selectRobotLoading,
  selectHardwareErrors
} from '../store/robotSlice';

/**
 * Safe robot data hook that ensures all data is properly initialized
 * and provides fallbacks for any undefined values
 */
export const useSafeRobotData = () => {
  const connected = useSelector(selectRobotConnected);
  const connectionStatus = useSelector(selectRobotConnectionStatus);
  const jointAngles = useSelector(selectRobotJointAngles);
  const jointPositions = useSelector(selectRobotJointPositions);
  const jointVelocities = useSelector(selectRobotJointVelocities);
  const actuators = useSelector(selectRobotActuators);
  const actuatorList = useSelector(selectRobotActuatorList);
  const safetyStatus = useSelector(selectRobotSafetyStatus);
  const bridgeStatus = useSelector(selectBridgeStatus);
  const error = useSelector(selectRobotError);
  const loading = useSelector(selectRobotLoading);
  const hardwareErrors = useSelector(selectHardwareErrors);

  // Additional safety checks and computed values
  const safeJointAngles = Array.isArray(jointAngles) ? jointAngles : [0.0, 0.0, 0.0];
  const safeJointPositions = Array.isArray(jointPositions) ? jointPositions : [0.0, 0.0, 0.0];
  const safeJointVelocities = Array.isArray(jointVelocities) ? jointVelocities : [0.0, 0.0, 0.0];
  const safeActuatorList = Array.isArray(actuatorList) ? actuatorList : [
    { id: 1, enabled: false, position: 0, velocity: 0, current: 0, temperature: 0 },
    { id: 2, enabled: false, position: 0, velocity: 0, current: 0, temperature: 0 },
    { id: 3, enabled: false, position: 0, velocity: 0, current: 0, temperature: 0 }
  ];
  const safeHardwareErrors = Array.isArray(hardwareErrors) ? hardwareErrors : [];

  // Computed states
  const isHardwareReady = connected && connectionStatus === 'connected';
  const hasErrors = error || safeHardwareErrors.length > 0;
  const bridgeConnected = bridgeStatus?.connected || false;
  const activeBridges = Array.isArray(bridgeStatus?.active_bridges) ? bridgeStatus.active_bridges : [];

  // Joint angle conversions (radians to degrees)
  const jointAnglesDegrees = safeJointAngles.map(angle => (angle * 180 / Math.PI));
  
  // Safety status with defaults
  const safeSafetyStatus = safetyStatus || { safe: true, status: 'unknown' };

  // Actuator summary
  const enabledActuators = safeActuatorList.filter(actuator => actuator.enabled);
  const allActuatorsEnabled = safeActuatorList.every(actuator => actuator.enabled);

  return {
    // Connection status
    connected,
    connectionStatus,
    isHardwareReady,
    bridgeConnected,
    loading,

    // Joint data (always arrays)
    jointAngles: safeJointAngles,
    jointPositions: safeJointPositions,
    jointVelocities: safeJointVelocities,
    jointAnglesDegrees,

    // Actuator data (both formats)
    actuators,
    actuatorList: safeActuatorList,
    enabledActuators,
    allActuatorsEnabled,

    // Safety and errors
    safetyStatus: safeSafetyStatus,
    error,
    hardwareErrors: safeHardwareErrors,
    hasErrors,

    // Bridge status
    bridgeStatus,
    activeBridges,

    // Utility functions
    getJointAngle: (index) => {
      if (index >= 0 && index < safeJointAngles.length) {
        return safeJointAngles[index];
      }
      return 0.0;
    },

    getJointAngleDegrees: (index) => {
      if (index >= 0 && index < jointAnglesDegrees.length) {
        return jointAnglesDegrees[index];
      }
      return 0.0;
    },

    getActuator: (id) => {
      return safeActuatorList.find(actuator => actuator.id === id) || {
        id,
        enabled: false,
        position: 0,
        velocity: 0,
        current: 0,
        temperature: 0
      };
    },

    isActuatorEnabled: (id) => {
      const actuator = safeActuatorList.find(a => a.id === id);
      return actuator ? actuator.enabled : false;
    },

    // Status helpers
    getStatusColor: () => {
      if (hasErrors) return 'error';
      if (isHardwareReady) return 'success';
      if (connectionStatus === 'connecting') return 'warning';
      return 'default';
    },

    getStatusMessage: () => {
      if (loading) return 'Checking status...';
      if (hasErrors) return error || 'Hardware error detected';
      if (isHardwareReady) return 'Hardware ready';
      if (!bridgeConnected) return 'Hardware bridge not connected';
      if (connectionStatus === 'connecting') return 'Connecting to hardware...';
      return 'Hardware not connected';
    }
  };
};

export default useSafeRobotData;