// src/__mocks__/robotService.js
export class MockRobotService {
  constructor() {
    this.isConnected = false;
    this.currentPosition = [0, 0, 0];
    this.targetPosition = [0, 0, 0];
    this.isExecuting = false;
    this.executionDelay = 2000; // 2 seconds default
    this.simulateErrors = false;
    this.telemetryData = {
      joint_angles: [0, 0, 0],
      joint_velocities: [0, 0, 0],
      joint_currents: [0.5, 0.4, 0.3],
      joint_temperatures: [25, 26, 24],
      system_status: 'idle',
      timestamp: new Date().toISOString()
    };
  }

  // Connection management
  async connect() {
    if (this.simulateErrors) {
      throw new Error('Mock connection error');
    }
    
    await this.delay(500);
    this.isConnected = true;
    
    return {
      success: true,
      robotId: 'mock_robot_001',
      capabilities: ['move_joints', 'execute_code', 'get_telemetry'],
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    this.isConnected = false;
    return { success: true };
  }

  async getStatus() {
    return {
      connected: this.isConnected,
      executing: this.isExecuting,
      position: this.currentPosition,
      temperature: [25, 26, 24],
      voltage: 24.1,
      errors: []
    };
  }

  // Code execution
  async executeCode(code, options = {}) {
    if (!this.isConnected) {
      throw new Error('Robot not connected');
    }

    if (this.isExecuting) {
      throw new Error('Already executing code');
    }

    this.isExecuting = true;

    try {
      // Simulate code parsing and execution
      await this.delay(this.executionDelay);
      
      // Parse target angles from code (simple regex matching)
      const targetMatches = code.match(/move_joint\(\s*(\d+)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g);
      
      if (targetMatches) {
        const newPosition = [...this.currentPosition];
        
        targetMatches.forEach(match => {
          const [, jointId, angle] = match.match(/move_joint\(\s*(\d+)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
          const jointIndex = parseInt(jointId) - 1;
          
          if (jointIndex >= 0 && jointIndex < 3) {
            newPosition[jointIndex] = parseFloat(angle);
          }
        });
        
        this.currentPosition = newPosition;
        this.targetPosition = options.targetPosition || newPosition;
      }

      // Calculate position error
      const positionError = this.calculatePositionError(
        this.currentPosition,
        this.targetPosition
      );

      this.isExecuting = false;

      return {
        success: true,
        finalPosition: this.currentPosition,
        positionError,
        executionTime: this.executionDelay,
        logs: [
          'Robot connected successfully',
          `Moving joints to target position`,
          `Final position: [${this.currentPosition.join(', ')}]`,
          `Position error: ${positionError.toFixed(3)}°`
        ]
      };

    } catch (error) {
      this.isExecuting = false;
      throw error;
    }
  }

  // Joint movement
  async moveJoint(jointId, angle, options = {}) {
    if (!this.isConnected) {
      throw new Error('Robot not connected');
    }

    const jointIndex = jointId - 1;
    if (jointIndex < 0 || jointIndex >= 3) {
      throw new Error(`Invalid joint ID: ${jointId}`);
    }

    // Validate joint limits
    const limits = [
      { min: -150, max: 150 },
      { min: -120, max: 120 },
      { min: -90, max: 90 }
    ];

    if (angle < limits[jointIndex].min || angle > limits[jointIndex].max) {
      throw new Error(`Joint ${jointId} angle ${angle}° outside safe range`);
    }

    await this.delay(500);
    this.currentPosition[jointIndex] = angle;

    return {
      success: true,
      jointId,
      finalAngle: angle,
      timestamp: new Date().toISOString()
    };
  }

  async moveToPosition(targetAngles, options = {}) {
    if (!this.isConnected) {
      throw new Error('Robot not connected');
    }

    await this.delay(1000);
    this.currentPosition = [...targetAngles];
    this.targetPosition = [...targetAngles];

    return {
      success: true,
      finalPosition: this.currentPosition,
      timestamp: new Date().toISOString()
    };
  }

  // Telemetry
  async getTelemetry() {
    if (!this.isConnected) {
      throw new Error('Robot not connected');
    }

    // Add some realistic noise to telemetry
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    this.telemetryData = {
      joint_angles: this.currentPosition.map(angle => angle + noise()),
      joint_velocities: this.isExecuting ? [0.5, 0.3, 0.2] : [0, 0, 0],
      joint_currents: [0.5 + noise(), 0.4 + noise(), 0.3 + noise()],
      joint_temperatures: [25 + noise(), 26 + noise(), 24 + noise()],
      end_effector_position: this.calculateEndEffectorPosition(),
      system_status: this.isExecuting ? 'executing' : 'idle',
      timestamp: new Date().toISOString()
    };

    return this.telemetryData;
  }

  async getCurrentPosition() {
    return [...this.currentPosition];
  }

  // Safety functions
  async emergencyStop() {
    this.isExecuting = false;
    return { success: true, timestamp: new Date().toISOString() };
  }

  async resetToHome() {
    await this.moveToPosition([0, 0, 0]);
    return { success: true };
  }

  // Utility functions
  calculatePositionError(current, target) {
    if (!current || !target) return 0;
    const errors = current.map((pos, i) => Math.abs(pos - (target[i] || 0)));
    return Math.max(...errors);
  }

  calculateEndEffectorPosition() {
    const [θ1, θ2, θ3] = this.currentPosition.map(angle => angle * Math.PI / 180);
    const L1 = 140, L2 = 120, L3 = 100;
    
    const x = L1 * Math.cos(θ1) + L2 * Math.cos(θ1 + θ2) + L3 * Math.cos(θ1 + θ2 + θ3);
    const y = L1 * Math.sin(θ1) + L2 * Math.sin(θ1 + θ2) + L3 * Math.sin(θ1 + θ2 + θ3);
    
    return { x, y, z: 0 };
  }

  // Test utilities
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setExecutionDelay(ms) {
    this.executionDelay = ms;
  }

  setSimulateErrors(enable) {
    this.simulateErrors = enable;
  }

  setPosition(position) {
    this.currentPosition = [...position];
  }

  // Simulate hardware events
  simulateTemperatureIncrease() {
    this.telemetryData.joint_temperatures = [60, 65, 58]; // High temperatures
  }

  simulateConnectionLoss() {
    this.isConnected = false;
  }

  simulateJointLimitViolation() {
    this.currentPosition = [200, 200, 200]; // Outside safe limits
  }
}