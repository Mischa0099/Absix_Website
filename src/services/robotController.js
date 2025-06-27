import { COMMANDS, ROBOT_SPECS, SERIAL_CONFIG } from '../utils/constants';
import { rawToDegrees, degreesToPositionRaw, degreesToVelocityRaw } from '../utils/robotUtils';
import { debugLog, errorLog, delay, retryWithBackoff } from '../utils/helpers';

export const robotService = {
  // Connection management
  serialPort: null,
  reader: null,
  writer: null,
  isConnected: false,
  commandQueue: [],
  responseHandlers: new Map(),

  // Initialize robot controller
  async initialize() {
    try {
      debugLog('Initializing robot controller service');
      
      // Check WebSerial support
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API not supported');
      }

      return true;
    } catch (error) {
      errorLog('Robot controller initialization failed', error);
      throw error;
    }
  },

  // Connect to robot via WebSerial
  async connect() {
    try {
      if (this.isConnected) {
        debugLog('Already connected to robot');
        return true;
      }

      debugLog('Requesting serial port...');
      
      this.serialPort = await navigator.serial.requestPort();
      
      await this.serialPort.open({
        baudRate: SERIAL_CONFIG.BAUDRATE,
        dataBits: SERIAL_CONFIG.DATA_BITS,
        stopBits: SERIAL_CONFIG.STOP_BITS,
        parity: SERIAL_CONFIG.PARITY,
      });

      this.reader = this.serialPort.readable.getReader();
      this.writer = this.serialPort.writable.getWriter();
      this.isConnected = true;

      // Start reading responses
      this.startReading();

      debugLog('Successfully connected to robot');
      return true;

    } catch (error) {
      errorLog('Robot connection failed', error);
      this.cleanup();
      throw error;
    }
  },

  // Disconnect from robot
  async disconnect() {
    try {
      this.isConnected = false;
      
      // Clear command queue
      this.commandQueue = [];
      this.responseHandlers.clear();

      // Close reader and writer
      if (this.reader) {
        await this.reader.cancel();
        await this.reader.releaseLock();
        this.reader = null;
      }

      if (this.writer) {
        await this.writer.releaseLock();
        this.writer = null;
      }

      // Close serial port
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }

      debugLog('Disconnected from robot');
      return true;

    } catch (error) {
      errorLog('Disconnect error', error);
      this.cleanup();
      throw error;
    }
  },

  // Cleanup connections
  cleanup() {
    this.isConnected = false;
    this.serialPort = null;
    this.reader = null;
    this.writer = null;
    this.commandQueue = [];
    this.responseHandlers.clear();
  },

  // Start reading serial responses
  async startReading() {
    let dataBuffer = '';

    try {
      while (this.isConnected && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        dataBuffer += text;

        // Process complete lines
        const lines = dataBuffer.split('\n');
        dataBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            this.processResponse(trimmedLine);
          }
        }
      }
    } catch (error) {
      if (this.isConnected) {
        errorLog('Serial reading error', error);
      }
    }
  },

  // Process incoming responses
  processResponse(response) {
    debugLog('Received response:', response);

    // Handle different response types
    if (response === 'OK') {
      this.handleCommandSuccess();
    } else if (response.startsWith('ERROR:')) {
      this.handleCommandError(response.substring(6));
    } else if (response === 'PING_OK') {
      this.handlePingResponse(true);
    } else if (response === 'PING_FAIL') {
      this.handlePingResponse(false);
    } else if (response.startsWith('POS:')) {
      this.handlePositionResponse(response);
    } else if (response.startsWith('VEL:')) {
      this.handleVelocityResponse(response);
    } else if (response.startsWith('TEMP:')) {
      this.handleTemperatureResponse(response);
    } else if (response === 'ESP32_DYNAMIXEL_CONTROLLER_READY') {
      this.handleControllerReady();
    }
  },

  // Handle command responses
  handleCommandSuccess() {
    const handler = this.responseHandlers.get('command');
    if (handler) {
      handler.resolve(true);
      this.responseHandlers.delete('command');
    }
  },

  handleCommandError(error) {
    const handler = this.responseHandlers.get('command');
    if (handler) {
      handler.reject(new Error(error));
      this.responseHandlers.delete('command');
    }
  },

  handlePingResponse(success) {
    const handler = this.responseHandlers.get('ping');
    if (handler) {
      handler.resolve(success);
      this.responseHandlers.delete('ping');
    }
  },

  handlePositionResponse(response) {
    const parts = response.split(':');
    if (parts.length >= 3) {
      const motorId = parseInt(parts[1]);
      const position = parseInt(parts[2]);
      const degrees = rawToDegrees(position);
      
      const handler = this.responseHandlers.get(`position_${motorId}`);
      if (handler) {
        handler.resolve({ motorId, position, degrees });
        this.responseHandlers.delete(`position_${motorId}`);
      }
    }
  },

  handleVelocityResponse(response) {
    const parts = response.split(':');
    if (parts.length >= 3) {
      const motorId = parseInt(parts[1]);
      const velocity = parseInt(parts[2]);
      
      const handler = this.responseHandlers.get(`velocity_${motorId}`);
      if (handler) {
        handler.resolve({ motorId, velocity });
        this.responseHandlers.delete(`velocity_${motorId}`);
      }
    }
  },

  handleTemperatureResponse(response) {
    const parts = response.split(':');
    if (parts.length >= 3) {
      const motorId = parseInt(parts[1]);
      const temperature = parseInt(parts[2]);
      
      const handler = this.responseHandlers.get(`temperature_${motorId}`);
      if (handler) {
        handler.resolve({ motorId, temperature });
        this.responseHandlers.delete(`temperature_${motorId}`);
      }
    }
  },

  handleControllerReady() {
    const handler = this.responseHandlers.get('ready');
    if (handler) {
      handler.resolve(true);
      this.responseHandlers.delete('ready');
    }
  },

  // Send command to robot
  async sendCommand(command, timeout = SERIAL_CONFIG.TIMEOUT) {
    if (!this.isConnected || !this.writer) {
      throw new Error('Robot not connected');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const commandWithTerminator = command.endsWith(';') ? command : command + ';';
        
        // Set up response handler
        this.responseHandlers.set('command', { resolve, reject });
        
        // Set timeout
        const timeoutId = setTimeout(() => {
          this.responseHandlers.delete('command');
          reject(new Error('Command timeout'));
        }, timeout);

        // Send command
        const encoder = new TextEncoder();
        await this.writer.write(encoder.encode(commandWithTerminator));
        
        debugLog('Sent command:', commandWithTerminator);

        // Clear timeout when resolved/rejected
        const originalResolve = resolve;
        const originalReject = reject;
        
        resolve = (value) => {
          clearTimeout(timeoutId);
          originalResolve(value);
        };
        
        reject = (error) => {
          clearTimeout(timeoutId);
          originalReject(error);
        };

      } catch (error) {
        this.responseHandlers.delete('command');
        reject(error);
      }
    });
  },

  // Motor control functions
  async pingMotor(motorId) {
    try {
      return new Promise(async (resolve, reject) => {
        this.responseHandlers.set('ping', { resolve, reject });
        
        const timeoutId = setTimeout(() => {
          this.responseHandlers.delete('ping');
          resolve(false); // Return false on timeout instead of error
        }, 1000);

        try {
          await this.sendCommand(`${COMMANDS.PING}:${motorId}`);
        } catch (error) {
          clearTimeout(timeoutId);
          this.responseHandlers.delete('ping');
          resolve(false);
        }
      });
    } catch (error) {
      debugLog(`Ping motor ${motorId} failed:`, error);
      return false;
    }
  },

  async enableTorque(motorId) {
    try {
      await this.sendCommand(`${COMMANDS.ENABLE_TORQUE}:${motorId}`);
      return true;
    } catch (error) {
      errorLog(`Enable torque failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async disableTorque(motorId) {
    try {
      await this.sendCommand(`${COMMANDS.DISABLE_TORQUE}:${motorId}`);
      return true;
    } catch (error) {
      errorLog(`Disable torque failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async setPosition(motorId, degrees) {
    try {
      const positionRaw = degreesToPositionRaw(degrees);
      await this.sendCommand(`${COMMANDS.SET_POSITION}:${motorId}:${positionRaw}`);
      return true;
    } catch (error) {
      errorLog(`Set position failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async setVelocity(motorId, degreesPerSec) {
    try {
      const velocityRaw = degreesToVelocityRaw(degreesPerSec);
      await this.sendCommand(`${COMMANDS.SET_VELOCITY}:${motorId}:${velocityRaw}`);
      return true;
    } catch (error) {
      errorLog(`Set velocity failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async getPosition(motorId) {
    try {
      return new Promise(async (resolve, reject) => {
        this.responseHandlers.set(`position_${motorId}`, { resolve, reject });
        
        const timeoutId = setTimeout(() => {
          this.responseHandlers.delete(`position_${motorId}`);
          reject(new Error('Position read timeout'));
        }, 2000);

        try {
          await this.sendCommand(`${COMMANDS.GET_POSITION}:${motorId}`);
        } catch (error) {
          clearTimeout(timeoutId);
          this.responseHandlers.delete(`position_${motorId}`);
          reject(error);
        }
      });
    } catch (error) {
      errorLog(`Get position failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async getVelocity(motorId) {
    try {
      return new Promise(async (resolve, reject) => {
        this.responseHandlers.set(`velocity_${motorId}`, { resolve, reject });
        
        const timeoutId = setTimeout(() => {
          this.responseHandlers.delete(`velocity_${motorId}`);
          reject(new Error('Velocity read timeout'));
        }, 2000);

        try {
          await this.sendCommand(`${COMMANDS.GET_VELOCITY}:${motorId}`);
        } catch (error) {
          clearTimeout(timeoutId);
          this.responseHandlers.delete(`velocity_${motorId}`);
          reject(error);
        }
      });
    } catch (error) {
      errorLog(`Get velocity failed for motor ${motorId}`, error);
      throw error;
    }
  },

  async getTemperature(motorId) {
    try {
      return new Promise(async (resolve, reject) => {
        this.responseHandlers.set(`temperature_${motorId}`, { resolve, reject });
        
        const timeoutId = setTimeout(() => {
          this.responseHandlers.delete(`temperature_${motorId}`);
          reject(new Error('Temperature read timeout'));
        }, 2000);

        try {
          await this.sendCommand(`GET_TEMP:${motorId}`);
        } catch (error) {
          clearTimeout(timeoutId);
          this.responseHandlers.delete(`temperature_${motorId}`);
          reject(error);
        }
      });
    } catch (error) {
      errorLog(`Get temperature failed for motor ${motorId}`, error);
      throw error;
    }
  },

  // Get comprehensive motor data
  async getMotorData(motorId) {
    try {
      const [position, velocity, temperature] = await Promise.allSettled([
        this.getPosition(motorId),
        this.getVelocity(motorId),
        this.getTemperature(motorId),
      ]);

      return {
        position: position.status === 'fulfilled' ? position.value.degrees : null,
        velocity: velocity.status === 'fulfilled' ? velocity.value.velocity : null,
        temperature: temperature.status === 'fulfilled' ? temperature.value.temperature : null,
      };
    } catch (error) {
      errorLog(`Get motor data failed for motor ${motorId}`, error);
      throw error;
    }
  },

  // Operating mode control
  async setOperatingMode(motorId, mode) {
    try {
      await this.sendCommand(`${COMMANDS.SET_MODE}:${motorId}:${mode}`);
      return true;
    } catch (error) {
      errorLog(`Set operating mode failed for motor ${motorId}`, error);
      throw error;
    }
  },

  // Emergency stop
  async emergencyStop() {
    try {
      await this.sendCommand(COMMANDS.EMERGENCY_STOP);
      return true;
    } catch (error) {
      errorLog('Emergency stop failed', error);
      throw error;
    }
  },

  // Home motor (move to center position)
  async homeMotor(motorId) {
    try {
      await this.setPosition(motorId, 180); // Center position
      return true;
    } catch (error) {
      errorLog(`Home motor failed for motor ${motorId}`, error);
      throw error;
    }
  },

  // Challenge execution
  async executeChallenge(challengeId, parameters) {
    try {
      debugLog('Executing challenge:', challengeId, parameters);

      // Challenge-specific implementation would go here
      // For now, return a mock result
      return {
        success: true,
        score: 85,
        executionTime: parameters.duration || 30000,
        data: [],
      };
    } catch (error) {
      errorLog('Challenge execution failed', error);
      throw error;
    }
  },

  // Batch operations
  async batchCommand(commands) {
    const results = [];
    
    for (const command of commands) {
      try {
        const result = await this.sendCommand(command);
        results.push({ command, success: true, result });
        
        // Small delay between commands
        await delay(SERIAL_CONFIG.COMMAND_DELAY);
      } catch (error) {
        results.push({ command, success: false, error: error.message });
      }
    }
    
    return results;
  },

  // Scan for available motors
  async scanMotors(startId = 1, endId = 10) {
    const detectedMotors = [];
    
    for (let id = startId; id <= endId; id++) {
      try {
        const isOnline = await this.pingMotor(id);
        
        if (isOnline) {
          // Get initial motor data
          const motorData = await this.getMotorData(id);
          
          detectedMotors.push({
            id,
            online: true,
            ...motorData,
          });
        }
        
        // Small delay between scans
        await delay(200);
      } catch (error) {
        debugLog(`Motor ${id} scan failed:`, error);
      }
    }
    
    return detectedMotors;
  },

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      port: this.serialPort,
      hasReader: !!this.reader,
      hasWriter: !!this.writer,
      queueSize: this.commandQueue.length,
      pendingResponses: this.responseHandlers.size,
    };
  },
};