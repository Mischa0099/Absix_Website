// 2. Mock WebSocket Service
// ============================================================================

// src/__mocks__/websocketService.js
export class MockWebSocketService {
  constructor() {
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.subscriptions = new Set();
    this.eventHandlers = {};
    this.messageQueue = [];
    this.mockDelay = 100;
  }

  connect(options = {}) {
    return new Promise((resolve) => {
      this.eventHandlers = options;
      
      setTimeout(() => {
        this.isConnected = true;
        
        if (this.eventHandlers.onOpen) {
          this.eventHandlers.onOpen({ type: 'open' });
        }
        
        // Start sending mock telemetry
        this.startMockTelemetry();
        
        resolve(this);
      }, this.mockDelay);
    });
  }

  disconnect() {
    this.isConnected = false;
    this.stopMockTelemetry();
    
    if (this.eventHandlers.onClose) {
      this.eventHandlers.onClose({ code: 1000, reason: 'Manual disconnect' });
    }
  }

  send(message) {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return false;
    }

    const messageObj = typeof message === 'string' ? JSON.parse(message) : message;
    
    // Simulate response based on message type
    setTimeout(() => {
      this.handleMessage(messageObj);
    }, this.mockDelay);

    return true;
  }

  handleMessage(message) {
    switch (message.type) {
      case 'execute_code':
        this.simulateCodeExecution(message.payload);
        break;
      case 'request_telemetry':
        this.sendTelemetryUpdate();
        break;
      case 'move_joint':
        this.simulateJointMovement(message.payload);
        break;
      case 'emergency_stop':
        this.simulateEmergencyStop();
        break;
      default:
        console.log('Mock WebSocket received:', message);
    }
  }

  simulateCodeExecution(payload) {
    // Send execution progress
    this.sendMessage({
      type: 'execution_progress',
      payload: { progress: 0, status: 'parsing' }
    });

    setTimeout(() => {
      this.sendMessage({
        type: 'execution_progress',
        payload: { progress: 50, status: 'converting' }
      });
    }, 500);

    setTimeout(() => {
      this.sendMessage({
        type: 'execution_progress',
        payload: { progress: 100, status: 'executing' }
      });
    }, 1000);

    setTimeout(() => {
      this.sendMessage({
        type: 'execution_result',
        payload: {
          success: true,
          finalPosition: [30, 0, 0],
          positionError: 2.5,
          executionTime: 2000
        }
      });
    }, 2000);
  }

  simulateJointMovement(payload) {
    this.sendMessage({
      type: 'robot_telemetry',
      payload: {
        joint_angles: [payload.angle, 0, 0],
        joint_velocities: [0.5, 0, 0],
        system_status: 'moving'
      }
    });

    setTimeout(() => {
      this.sendMessage({
        type: 'robot_telemetry',
        payload: {
          joint_angles: [payload.angle, 0, 0],
          joint_velocities: [0, 0, 0],
          system_status: 'idle'
        }
      });
    }, 1000);
  }

  simulateEmergencyStop() {
    this.sendMessage({
      type: 'robot_status',
      payload: {
        connected: true,
        status: 'emergency_stop',
        timestamp: new Date().toISOString()
      }
    });
  }

  startMockTelemetry() {
    this.telemetryInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendTelemetryUpdate();
      }
    }, 100); // 10Hz
  }

  stopMockTelemetry() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
    }
  }

  sendTelemetryUpdate() {
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    this.sendMessage({
      type: 'robot_telemetry',
      payload: {
        joint_angles: [0 + noise(), 0 + noise(), 0 + noise()],
        joint_velocities: [0, 0, 0],
        joint_currents: [0.5, 0.4, 0.3],
        joint_temperatures: [25, 26, 24],
        system_status: 'idle',
        timestamp: new Date().toISOString()
      }
    });
  }

  sendMessage(message) {
    if (this.eventHandlers.onMessage) {
      this.eventHandlers.onMessage(message);
    }
  }

  // Test utilities
  setMockDelay(ms) {
    this.mockDelay = ms;
  }

  triggerError(errorMessage) {
    this.sendMessage({
      type: 'error',
      payload: { message: errorMessage }
    });
  }

  triggerConnectionLoss() {
    this.isConnected = false;
    if (this.eventHandlers.onClose) {
      this.eventHandlers.onClose({ code: 1006, reason: 'Connection lost' });
    }
  }
}
