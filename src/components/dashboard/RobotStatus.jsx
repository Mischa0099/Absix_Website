// src/components/dashboard/RobotStatus.jsx - Fixed version
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faWifi,
  faWifiSlash,
  faShieldCheck,
  faShieldExclamation,
  faShieldTimes,
  faShieldQuestion,
  faThermometerHalf,
  faBolt,
  faStop,
  faCrosshairs,
  faMicrochip,
  faMemory,
  faPowerOff,
  faPause
} from '@fortawesome/free-solid-svg-icons';
import { connectRobot, disconnectRobot } from '../../store/robotSlice';
import './RobotStatus.css'; // We'll create this CSS file

const RobotStatus = ({ robotStatus = {} }) => {
  const dispatch = useDispatch();
  const { isConnected, position, sensors, batteryLevel, status } = useSelector(state => state.robot);
  
  const [animatedValues, setAnimatedValues] = useState({
    temperature: 0,
    voltage: 0,
    joints: []
  });

  const {
    connected = isConnected,
    joints = [],
    safety_status = 'normal',
    temperature = 35.2,
    voltage = 12.0,
    last_update = new Date().toISOString()
  } = robotStatus;

  // Animate values counting up
  useEffect(() => {
    const animateToTarget = (target, current, setter) => {
      const diff = target - current;
      const steps = 20;
      const stepSize = diff / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const newValue = current + (stepSize * step);
        setter(step === steps ? target : newValue);
        
        if (step === steps) {
          clearInterval(interval);
        }
      }, 50);
    };

    if (connected) {
      animateToTarget(temperature, animatedValues.temperature, 
        (val) => setAnimatedValues(prev => ({ ...prev, temperature: val }))
      );
      animateToTarget(voltage, animatedValues.voltage,
        (val) => setAnimatedValues(prev => ({ ...prev, voltage: val }))
      );
    }
  }, [temperature, voltage, connected, animatedValues.temperature, animatedValues.voltage]);

  const getConnectionStatus = () => {
    if (connected) {
      return {
        icon: faWifi,
        text: 'Connected',
        color: '#28a745',
        pulse: true
      };
    }
    return {
      icon: faWifiSlash,
      text: 'Disconnected',
      color: '#dc3545',
      pulse: false
    };
  };

  const getSafetyStatus = () => {
    switch (safety_status) {
      case 'normal':
      case 'ok':
        return {
          icon: faShieldCheck,
          text: 'Safe',
          color: '#28a745'
        };
      case 'warning':
        return {
          icon: faShieldExclamation,
          text: 'Warning',
          color: '#ffc107'
        };
      case 'emergency':
        return {
          icon: faShieldTimes,
          text: 'Emergency',
          color: '#dc3545'
        };
      default:
        return {
          icon: faShieldQuestion,
          text: 'Unknown',
          color: '#6c757d'
        };
    }
  };

  const getTemperatureStatus = () => {
    if (temperature > 50) {
      return { color: '#dc3545', status: 'Hot' };
    } else if (temperature > 40) {
      return { color: '#ffc107', status: 'Warm' };
    } else {
      return { color: '#28a745', status: 'Normal' };
    }
  };

  const handleEmergencyStop = () => {
    console.log('Emergency stop triggered');
    // Add emergency stop logic here
  };

  const handleCalibrate = () => {
    console.log('Calibration started');
    // Add calibration logic here
  };

  const connectionStatus = getConnectionStatus();
  const safetyInfo = getSafetyStatus();
  const tempInfo = getTemperatureStatus();

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="robot-status-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Robot Status Card */}
      <div className="robot-status-card">
        <motion.div className="status-header" variants={itemVariants}>
          <h3>
            <FontAwesomeIcon icon={faRobot} />
            Robot Status
          </h3>
          <div className="last-update">
            {last_update && (
              <span>Updated: {new Date(last_update).toLocaleTimeString()}</span>
            )}
          </div>
        </motion.div>

        {/* Robot Avatar */}
        <motion.div className="robot-avatar" variants={itemVariants}>
          <div className={`robot-display ${connected ? 'connected' : 'disconnected'}`}>
            <motion.div
              animate={{
                scale: connected ? [1, 1.1, 1] : 1,
                rotate: connected ? [0, 5, -5, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: connected ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              <FontAwesomeIcon icon={faRobot} size="3x" />
            </motion.div>
          </div>
          <div className="connection-indicator">
            <motion.div 
              className="status-dot"
              style={{ backgroundColor: connectionStatus.color }}
              animate={{
                scale: connectionStatus.pulse ? [1, 1.2, 1] : 1,
                opacity: connectionStatus.pulse ? [1, 0.7, 1] : 1
              }}
              transition={{
                duration: 1.5,
                repeat: connectionStatus.pulse ? Infinity : 0
              }}
            />
          </div>
        </motion.div>

        {/* Status Information */}
        <div className="status-info">
          <motion.div className="status-item connection" variants={itemVariants}>
            <div className="status-label">
              <FontAwesomeIcon icon={connectionStatus.icon} style={{ color: connectionStatus.color }} />
              Connection
            </div>
            <div className="status-value" style={{ color: connectionStatus.color }}>
              {connectionStatus.text}
            </div>
          </motion.div>

          <motion.div className="status-item temperature" variants={itemVariants}>
            <div className="status-label">
              <FontAwesomeIcon icon={faThermometerHalf} style={{ color: tempInfo.color }} />
              Temperature
            </div>
            <div className="status-value">
              <motion.span
                key={Math.floor(animatedValues.temperature)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                style={{ color: tempInfo.color }}
              >
                {animatedValues.temperature.toFixed(1)}°C
              </motion.span>
              <span className="status-indicator-text" style={{ color: tempInfo.color }}>
                {tempInfo.status}
              </span>
            </div>
          </motion.div>

          <motion.div className="status-item voltage" variants={itemVariants}>
            <div className="status-label">
              <FontAwesomeIcon icon={faBolt} style={{ color: '#ffd60a' }} />
              Voltage
            </div>
            <div className="status-value">
              <motion.span
                key={Math.floor(animatedValues.voltage)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                style={{ color: '#ffd60a' }}
              >
                {animatedValues.voltage.toFixed(1)}V
              </motion.span>
            </div>
          </motion.div>

          <motion.div className="status-item safety" variants={itemVariants}>
            <div className="status-label">
              <FontAwesomeIcon icon={safetyInfo.icon} style={{ color: safetyInfo.color }} />
              Safety
            </div>
            <div className="status-value" style={{ color: safetyInfo.color }}>
              {safetyInfo.text}
            </div>
          </motion.div>
        </div>

        {/* Joint Status */}
        <AnimatePresence>
          {connected && joints.length > 0 && (
            <motion.div 
              className="joints-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4>Joint Status</h4>
              <div className="joints-grid">
                {joints.map((joint, index) => (
                  <motion.div 
                    key={joint.id || index}
                    className="joint-item"
                    variants={itemVariants}
                  >
                    <div className="joint-header">
                      <span className="joint-label">Joint {joint.id || index + 1}</span>
                      <div className={`joint-status ${joint.torque_enabled ? 'enabled' : 'disabled'}`}>
                        <FontAwesomeIcon 
                          icon={joint.torque_enabled ? faPowerOff : faPause}
                        />
                      </div>
                    </div>
                    <div className="joint-values">
                      <div className="joint-value">
                        <span className="value-label">Pos:</span>
                        <span className="value-number">
                          {(joint.position || 0).toFixed(2)}°
                        </span>
                      </div>
                      <div className="joint-value">
                        <span className="value-label">Vel:</span>
                        <span className="value-number">
                          {(joint.velocity || 0).toFixed(2)}°/s
                        </span>
                      </div>
                      {joint.temperature && (
                        <div className="joint-value">
                          <span className="value-label">Temp:</span>
                          <span className="value-number">
                            {joint.temperature.toFixed(1)}°C
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div className="quick-actions" variants={itemVariants}>
          <button 
            className="action-btn emergency"
            onClick={handleEmergencyStop}
          >
            <FontAwesomeIcon icon={faStop} />
            Emergency Stop
          </button>
          <button 
            className="action-btn calibrate"
            onClick={handleCalibrate}
            disabled={!connected}
          >
            <FontAwesomeIcon icon={faCrosshairs} />
            Calibrate
          </button>
        </motion.div>
      </div>

      {/* System Health Indicators */}
      <motion.div className="health-indicators" variants={itemVariants}>
        <h4>System Health</h4>
        <div className="health-grid">
          <div className="health-item">
            <div className="health-icon">
              <FontAwesomeIcon icon={faMicrochip} />
            </div>
            <div className="health-info">
              <span className="health-label">CPU</span>
              <div className="health-bar">
                <motion.div 
                  className="health-fill cpu"
                  initial={{ width: 0 }}
                  animate={{ width: connected ? '45%' : '0%' }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="health-value">45%</span>
            </div>
          </div>

          <div className="health-item">
            <div className="health-icon">
              <FontAwesomeIcon icon={faMemory} />
            </div>
            <div className="health-info">
              <span className="health-label">Memory</span>
              <div className="health-bar">
                <motion.div 
                  className="health-fill memory"
                  initial={{ width: 0 }}
                  animate={{ width: connected ? '62%' : '0%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <span className="health-value">62%</span>
            </div>
          </div>

          <div className="health-item">
            <div className="health-icon">
              <FontAwesomeIcon icon={faWifi} />
            </div>
            <div className="health-info">
              <span className="health-label">Network</span>
              <div className="health-bar">
                <motion.div 
                  className="health-fill network"
                  initial={{ width: 0 }}
                  animate={{ width: connected ? '88%' : '0%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
              <span className="health-value">88%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RobotStatus;
