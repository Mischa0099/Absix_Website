/**
 * Enhanced Robot Service - Backend API Integration
 * Handles HTTP API communication with backend and hardware bridge
 */

import axios from 'axios';

class RobotService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
    this.hardwareBridgeURL = process.env.REACT_APP_HARDWARE_BRIDGE_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds
    
    // Create axios instances
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.hardwareClient = axios.create({
      baseURL: this.hardwareBridgeURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptors for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptors for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle authentication errors
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    
    this.hardwareClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Hardware bridge error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Connect to robot hardware
   * @returns {Promise<Object>} Connection result
   */
  async connect() {
    try {
      // First check if hardware bridge is available
      const bridgeStatus = await this.getHardwareBridgeStatus();
      
      if (!bridgeStatus.available) {
        throw new Error('Hardware bridge not available');
      }
      
      // Request connection through backend API
      const response = await this.apiClient.post('/robot/connect', {
        hardwareBridgeUrl: this.hardwareBridgeURL,
        timeout: this.timeout
      });
      
      if (response.data.success) {
        // Verify connection with direct hardware bridge call
        const hardwareResponse = await this.hardwareClient.post('/robot/connect');
        
        return {
          success: true,
          robotId: response.data.robotId,
          hardwareConnected: hardwareResponse.data.connected,
          capabilities: response.data.capabilities,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(response.data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Robot connection failed:', error);
      return {
        success: false,
        error: error.message || 'Connection failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Disconnect from robot hardware
   * @returns {Promise<Object>} Disconnection result
   */
  async disconnect() {
    try {
      // Disconnect through both backend and hardware bridge
      const [apiResponse, hardwareResponse] = await Promise.allSettled([
        this.apiClient.post('/robot/disconnect'),
        this.hardwareClient.post('/robot/disconnect')
      ]);
      
      return {
        success: true,
        apiDisconnected: apiResponse.status === 'fulfilled',
        hardwareDisconnected: hardwareResponse.status === 'fulfilled',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Robot disconnection error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get current robot status
   * @returns {Promise<Object>} Robot status
   */
  async getStatus() {
    try {
      const response = await this.apiClient.get('/robot/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get robot status:', error);
      throw new Error('Failed to get robot status');
    }
  }

  /**
   * Get hardware bridge status
   * @returns {Promise<Object>} Hardware bridge status
   */
  async getHardwareBridgeStatus() {
    try {
      const response = await this.hardwareClient.get('/status');
      return {
        available: true,
        ...response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute Python code on robot
   * @param {string} code Python code to execute
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, options = {}) {
    try {
      const requestData = {
        code,
        language: 'python',
        options: {
          challengeId: options.challengeId,
          targetPosition: options.targetPosition,
          safetyEnabled: options.safetyEnabled !== false,
          maxExecutionTime: options.maxExecutionTime || 30000,
          ...options
        },
        timestamp: new Date().toISOString()
      };

      // Send through backend API for logging and challenge tracking
      const apiResponse = await this.apiClient.post('/robot/execute', requestData);
      
      // If backend allows execution, send to hardware bridge for actual execution
      if (apiResponse.data.approved) {
        const hardwareResponse = await this.hardwareClient.post('/robot/execute', {
          ...requestData,
          executionId: apiResponse.data.executionId
        });
        
        // Calculate position error if target provided
        let positionError = 0;
        if (options.targetPosition && hardwareResponse.data.finalPosition) {
          positionError = this.calculatePositionError(
            hardwareResponse.data.finalPosition,
            options.targetPosition
          );
        }
        
        return {
          success: true,
          executionId: apiResponse.data.executionId,
          finalPosition: hardwareResponse.data.finalPosition,
          positionError,
          executionTime: hardwareResponse.data.executionTime,
          logs: hardwareResponse.data.logs,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(apiResponse.data.reason || 'Code execution not approved');
      }
    } catch (error) {
      console.error('Code execution failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get current robot position
   * @returns {Promise<Array<number>]} Joint angles in degrees
   */
  async getCurrentPosition() {
    try {
      const response = await this.hardwareClient.get('/robot/position');
      return response.data.joint_angles || [0, 0, 0];
    } catch (error) {
      console.error('Failed to get current position:', error);
      throw new Error('Failed to get current position');
    }
  }

  /**
   * Get real-time telemetry data
   * @returns {Promise<Object>} Telemetry data
   */
  async getTelemetry() {
    try {
      const response = await this.hardwareClient.get('/robot/telemetry');
      return response.data;
    } catch (error) {
      console.error('Failed to get telemetry:', error);
      throw new Error('Failed to get telemetry');
    }
  }

  /**
   * Move individual joint
   * @param {number} jointId Joint ID (1-3)
   * @param {number} angle Target angle in degrees
   * @param {Object} options Movement options
   * @returns {Promise<Object>} Movement result
   */
  async moveJoint(jointId, angle, options = {}) {
    try {
      // Validate joint parameters
      this.validateJointParameters(jointId, angle);
      
      const requestData = {
        jointId,
        angle,
        speed: options.speed || 50,
        acceleration: options.acceleration || 50,
        safetyEnabled: options.safetyEnabled !== false
      };

      // Send through backend for safety validation
      const apiResponse = await this.apiClient.post('/robot/move-joint', requestData);
      
      if (apiResponse.data.approved) {
        // Execute movement through hardware bridge
        const hardwareResponse = await this.hardwareClient.post('/robot/move-joint', {
          ...requestData,
          movementId: apiResponse.data.movementId
        });
        
        return {
          success: true,
          movementId: apiResponse.data.movementId,
          ...hardwareResponse.data
        };
      } else {
        throw new Error(apiResponse.data.reason || 'Movement not approved');
      }
    } catch (error) {
      console.error('Joint movement failed:', error);
      throw new Error(`Joint movement failed: ${error.message}`);
    }
  }

  /**
   * Move to target position
   * @param {Array<number>} targetAngles Target joint angles
   * @param {Object} options Movement options
   * @returns {Promise<Object>} Movement result
   */
  async moveToPosition(targetAngles, options = {}) {
    try {
      // Validate target angles
      if (!Array.isArray(targetAngles) || targetAngles.length !== 3) {
        throw new Error('Target angles must be an array of 3 values');
      }
      
      targetAngles.forEach((angle, index) => {
        this.validateJointParameters(index + 1, angle);
      });
      
      const requestData = {
        targetAngles,
        speed: options.speed || 50,
        acceleration: options.acceleration || 50,
        trajectory: options.trajectory || 'linear',
        safetyEnabled: options.safetyEnabled !== false
      };

      // Send through backend for safety validation
      const apiResponse = await this.apiClient.post('/robot/move-to-position', requestData);
      
      if (apiResponse.data.approved) {
        // Execute movement through hardware bridge
        const hardwareResponse = await this.hardwareClient.post('/robot/move-to-position', {
          ...requestData,
          movementId: apiResponse.data.movementId
        });
        
        return {
          success: true,
          movementId: apiResponse.data.movementId,
          ...hardwareResponse.data
        };
      } else {
        throw new Error(apiResponse.data.reason || 'Movement not approved');
      }
    } catch (error) {
      console.error('Position movement failed:', error);
      throw new Error(`Position movement failed: ${error.message}`);
    }
  }

  /**
   * Emergency stop
   * @returns {Promise<Object>} Emergency stop result
   */
  async emergencyStop() {
    try {
      // Send emergency stop to both backend and hardware bridge simultaneously
      const [apiResponse, hardwareResponse] = await Promise.allSettled([
        this.apiClient.post('/robot/emergency-stop'),
        this.hardwareClient.post('/robot/emergency-stop')
      ]);
      
      return {
        success: true,
        apiStopped: apiResponse.status === 'fulfilled',
        hardwareStopped: hardwareResponse.status === 'fulfilled',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Emergency stop failed:', error);
      // Emergency stop should always succeed at hardware level
      try {
        await this.hardwareClient.post('/robot/emergency-stop');
        return {
          success: true,
          hardwareStopped: true,
          apiStopped: false,
          timestamp: new Date().toISOString()
        };
      } catch (hardwareError) {
        throw new Error('Critical: Emergency stop failed at hardware level');
      }
    }
  }

  /**
   * Calibrate robot
   * @param {Object} options Calibration options
   * @returns {Promise<Object>} Calibration result
   */
  async calibrate(options = {}) {
    try {
      const requestData = {
        calibrationType: options.type || 'home',
        joints: options.joints || [1, 2, 3],
        speed: options.speed || 25, // Slow for safety
        ...options
      };

      // Send through backend for approval
      const apiResponse = await this.apiClient.post('/robot/calibrate', requestData);
      
      if (apiResponse.data.approved) {
        // Execute calibration through hardware bridge
        const hardwareResponse = await this.hardwareClient.post('/robot/calibrate', {
          ...requestData,
          calibrationId: apiResponse.data.calibrationId
        });
        
        return {
          success: true,
          calibrationId: apiResponse.data.calibrationId,
          ...hardwareResponse.data
        };
      } else {
        throw new Error(apiResponse.data.reason || 'Calibration not approved');
      }
    } catch (error) {
      console.error('Calibration failed:', error);
      throw new Error(`Calibration failed: ${error.message}`);
    }
  }

  /**
   * Reset robot to home position
   * @returns {Promise<Object>} Reset result
   */
  async resetToHome() {
    try {
      return await this.moveToPosition([0, 0, 0], {
        speed: 25,
        trajectory: 'linear',
        safetyEnabled: true
      });
    } catch (error) {
      console.error('Reset to home failed:', error);
      throw new Error(`Reset to home failed: ${error.message}`);
    }
  }

  /**
   * Get robot workspace boundaries
   * @returns {Promise<Object>} Workspace boundaries
   */
  async getWorkspaceBoundaries() {
    try {
      const response = await this.apiClient.get('/robot/workspace');
      return response.data;
    } catch (error) {
      // Return default values if API not available
      return {
        maxReach: 360, // mm
        minReach: 0,
        jointLimits: [
          { min: -150, max: 150 }, // Joint 1
          { min: -120, max: 120 }, // Joint 2
          { min: -90, max: 90 }    // Joint 3
        ]
      };
    }
  }

  /**
   * Get robot configuration
   * @returns {Promise<Object>} Robot configuration
   */
  async getRobotConfig() {
    try {
      const response = await this.apiClient.get('/robot/config');
      return response.data;
    } catch (error) {
      // Return default configuration
      return {
        dof: 3,
        linkLengths: [140, 120, 100], // mm
        jointTypes: ['revolute', 'revolute', 'revolute'],
        baseHeight: 50, // mm
        endEffectorLength: 20 // mm
      };
    }
  }

  /**
   * Save robot configuration
   * @param {Object} config Configuration to save
   * @returns {Promise<Object>} Save result
   */
  async saveRobotConfig(config) {
    try {
      const response = await this.apiClient.post('/robot/config', config);
      return response.data;
    } catch (error) {
      console.error('Failed to save robot config:', error);
      throw new Error('Failed to save robot configuration');
    }
  }

  /**
   * Get challenge-specific robot data
   * @param {string} challengeId Challenge ID
   * @returns {Promise<Object>} Challenge robot data
   */
  async getChallengeRobotData(challengeId) {
    try {
      const response = await this.apiClient.get(`/challenges/${challengeId}/robot-data`);
      return response.data;
    } catch (error) {
      console.error('Failed to get challenge robot data:', error);
      return null;
    }
  }

  /**
   * Submit challenge robot results
   * @param {string} challengeId Challenge ID
   * @param {Object} results Challenge results
   * @returns {Promise<Object>} Submission result
   */
  async submitChallengeResults(challengeId, results) {
    try {
      const response = await this.apiClient.post(`/challenges/${challengeId}/submit-robot-results`, results);
      return response.data;
    } catch (error) {
      console.error('Failed to submit challenge results:', error);
      throw new Error('Failed to submit challenge results');
    }
  }

  // Utility methods

  /**
   * Validate joint parameters
   * @param {number} jointId Joint ID
   * @param {number} angle Angle in degrees
   */
  validateJointParameters(jointId, angle) {
    const jointLimits = {
      1: { min: -150, max: 150 },
      2: { min: -120, max: 120 },
      3: { min: -90, max: 90 }
    };
    
    if (!jointLimits[jointId]) {
      throw new Error(`Invalid joint ID: ${jointId}`);
    }
    
    const limits = jointLimits[jointId];
    if (angle < limits.min || angle > limits.max) {
      throw new Error(`Joint ${jointId} angle ${angle}° outside safe range [${limits.min}°, ${limits.max}°]`);
    }
  }

  /**
   * Calculate position error between current and target
   * @param {Array<number>} currentAngles Current joint angles
   * @param {Array<number>} targetAngles Target joint angles
   * @returns {number} Maximum angular error in degrees
   */
  calculatePositionError(currentAngles, targetAngles) {
    if (!currentAngles || !targetAngles || currentAngles.length !== targetAngles.length) {
      return 0;
    }
    
    const errors = currentAngles.map((current, index) => 
      Math.abs(current - targetAngles[index])
    );
    
    return Math.max(...errors);
  }

  /**
   * Calculate forward kinematics
   * @param {Array<number>} jointAngles Joint angles in degrees
   * @returns {Object} End effector position
   */
  calculateForwardKinematics(jointAngles) {
    const [θ1, θ2, θ3] = jointAngles.map(angle => angle * Math.PI / 180);
    const [L1, L2, L3] = [140, 120, 100]; // Link lengths in mm
    
    const x = L1 * Math.cos(θ1) + L2 * Math.cos(θ1 + θ2) + L3 * Math.cos(θ1 + θ2 + θ3);
    const y = L1 * Math.sin(θ1) + L2 * Math.sin(θ1 + θ2) + L3 * Math.sin(θ1 + θ2 + θ3);
    const z = 0; // Planar robot
    
    return { x, y, z };
  }

  /**
   * Check if position is within workspace
   * @param {Object} position Position to check
   * @param {Object} workspace Workspace boundaries
   * @returns {boolean} True if position is reachable
   */
  isPositionReachable(position, workspace) {
    const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
    return distance >= workspace.minReach && distance <= workspace.maxReach;
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Service health
   */
  async getHealthStatus() {
    try {
      const [apiHealth, hardwareHealth] = await Promise.allSettled([
        this.apiClient.get('/health'),
        this.hardwareClient.get('/health')
      ]);
      
      return {
        api: {
          available: apiHealth.status === 'fulfilled',
          status: apiHealth.status === 'fulfilled' ? apiHealth.value.data : null,
          error: apiHealth.status === 'rejected' ? apiHealth.reason.message : null
        },
        hardware: {
          available: hardwareHealth.status === 'fulfilled',
          status: hardwareHealth.status === 'fulfilled' ? hardwareHealth.value.data : null,
          error: hardwareHealth.status === 'rejected' ? hardwareHealth.reason.message : null
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        api: { available: false, error: error.message },
        hardware: { available: false, error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
export const robotService = new RobotService();
export default robotService;