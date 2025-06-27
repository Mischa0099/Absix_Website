// src/store/robotSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import robotService from '../services/robotService';
import websocketService from '../services/websocketService';

// Async thunks for robot operations
export const connectRobot = createAsyncThunk(
  'robot/connect',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.connect();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const disconnectRobot = createAsyncThunk(
  'robot/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.disconnect();
      websocketService.disconnect();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const getRobotStatus = createAsyncThunk(
  'robot/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.getStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const fetchRobotStatus = createAsyncThunk(
  'robot/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.getStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const moveJoint = createAsyncThunk(
  'robot/moveJoint',
  async ({ jointId, position }, { rejectWithValue }) => {
    try {
      const response = await robotService.moveJoint(jointId, position);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const moveToPosition = createAsyncThunk(
  'robot/moveToPosition',
  async (positions, { rejectWithValue }) => {
    try {
      const response = await robotService.moveToPosition(positions);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const emergencyStop = createAsyncThunk(
  'robot/emergencyStop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.emergencyStop();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const calibrateRobot = createAsyncThunk(
  'robot/calibrate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotService.calibrate();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const executeCode = createAsyncThunk(
  'robot/executeCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await robotService.executeCode(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

const initialState = {
  // Connection state
  isConnected: false,
  connectionStatus: 'disconnected',
  loading: false,
  
  // Robot configuration
  robotConfig: {
    jointLimits: [
      { min: -180, max: 180 },
      { min: -90, max: 90 },
      { min: -90, max: 90 }
    ],
    maxTemperature: 60,
    maxCurrent: [2.0, 2.0, 2.0]
  },
  
  // Real-time telemetry data
  telemetry: {
    joint_angles: [0, 0, 0],
    joint_velocities: [0, 0, 0],
    joint_currents: [0, 0, 0],
    joint_temperatures: [25, 25, 25],
    joint_torques: [0, 0, 0],
    end_effector_position: { x: 0, y: 0, z: 0 },
    end_effector_velocity: { x: 0, y: 0, z: 0 },
    system_status: 'idle',
    timestamp: null,
    updateRate: 0
  },
  
  // Current position and target
  currentPosition: { x: 0, y: 0, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
  
  // Execution state
  executionState: {
    isExecuting: false,
    executionId: null,
    executionProgress: null,
    executionStartTime: null,
    executionEndTime: null,
    lastExecution: null,
    executionQueue: []
  },
  
  // Safety monitoring
  safety: {
    emergencyStopActive: false,
    temperatureAlarms: [],
    currentAlarms: [],
    positionAlarms: [],
    safetyViolations: []
  },
  
  // Calibration state
  calibration: {
    isCalibrated: false,
    calibrationProgress: 0,
    lastCalibration: null,
    calibrationData: null
  },
  
  // Performance metrics
  performance: {
    commandCount: 0,
    averageResponseTime: 0,
    lastCommandTime: null,
    telemetryStats: {
      packetsReceived: 0,
      packetsLost: 0,
      averageLatency: 0
    }
  },
  
  // Error handling
  errors: [],
  warnings: [],
  lastError: null
};

const robotSlice = createSlice({
  name: 'robot',
  initialState,
  reducers: {
    // Connection management
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    
    setConnectionError: (state, action) => {
      state.connectionStatus = 'error';
      state.isConnected = false;
      state.lastError = action.payload;
    },
    
    // Robot data updates
    setRobotData: (state, action) => {
      const data = action.payload;
      
      // Update telemetry
      if (data.joint_angles) state.telemetry.joint_angles = data.joint_angles;
      if (data.joint_velocities) state.telemetry.joint_velocities = data.joint_velocities;
      if (data.joint_currents) state.telemetry.joint_currents = data.joint_currents;
      if (data.joint_temperatures) state.telemetry.joint_temperatures = data.joint_temperatures;
      if (data.joint_torques) state.telemetry.joint_torques = data.joint_torques;
      if (data.end_effector_position) state.telemetry.end_effector_position = data.end_effector_position;
      if (data.end_effector_velocity) state.telemetry.end_effector_velocity = data.end_effector_velocity;
      if (data.system_status) state.telemetry.system_status = data.system_status;
      
      state.telemetry.timestamp = Date.now();
    },
    
    // Position management
    updateCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
    },
    
    setTargetPosition: (state, action) => {
      state.targetPosition = action.payload;
    },
    
    // Execution state
    setExecutionState: (state, action) => {
      state.executionState = { ...state.executionState, ...action.payload };
    },
    
    setExecutionProgress: (state, action) => {
      state.executionState.executionProgress = action.payload;
    },
    
    // Safety management
    setSafetyState: (state, action) => {
      state.safety = { ...state.safety, ...action.payload };
    },
    
    addSafetyViolation: (state, action) => {
      state.safety.safetyViolations.push(...action.payload);
    },
    
    clearSafetyViolations: (state) => {
      state.safety.safetyViolations = [];
    },
    
    // Calibration
    setCalibrationState: (state, action) => {
      state.calibration = { ...state.calibration, ...action.payload };
    },
    
    // Configuration
    setRobotConfig: (state, action) => {
      state.robotConfig = { ...state.robotConfig, ...action.payload };
    },
    
    // Performance tracking
    incrementCommandCount: (state) => {
      state.performance.commandCount += 1;
      state.performance.lastCommandTime = Date.now();
    },
    
    updatePerformanceMetrics: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    
    updateTelemetryStats: (state, action) => {
      state.performance.telemetryStats = { 
        ...state.performance.telemetryStats, 
        ...action.payload 
      };
    },
    
    resetPerformanceMetrics: (state) => {
      state.performance = {
        commandCount: 0,
        averageResponseTime: 0,
        lastCommandTime: null,
        telemetryStats: {
          packetsReceived: 0,
          packetsLost: 0,
          averageLatency: 0
        }
      };
    },
    
    // Error handling
    addError: (state, action) => {
      const error = {
        id: Date.now(),
        message: action.payload.message || action.payload,
        timestamp: Date.now(),
        type: action.payload.type || 'error',
        context: action.payload.context || null
      };
      state.errors.push(error);
      state.lastError = error;
    },
    
    removeError: (state, action) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    
    clearErrors: (state) => {
      state.errors = [];
      state.lastError = null;
    },
    
    addWarning: (state, action) => {
      const warning = {
        id: Date.now(),
        message: action.payload.message || action.payload,
        timestamp: Date.now(),
        type: action.payload.type || 'warning',
        context: action.payload.context || null
      };
      state.warnings.push(warning);
    },
    
    removeWarning: (state, action) => {
      state.warnings = state.warnings.filter(warning => warning.id !== action.payload);
    },
    
    clearWarnings: (state) => {
      state.warnings = [];
    },
    
    // General state management
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    resetRobotState: (state) => {
      return { ...initialState, robotConfig: state.robotConfig };
    },
    
    resetTelemetry: (state) => {
      state.telemetry = initialState.telemetry;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Connect robot
      .addCase(connectRobot.pending, (state) => {
        state.loading = true;
        state.lastError = null;
      })
      .addCase(connectRobot.fulfilled, (state, action) => {
        state.loading = false;
        state.isConnected = true;
        state.connectionStatus = 'connected';
        if (action.payload.config) {
          state.robotConfig = { ...state.robotConfig, ...action.payload.config };
        }
      })
      .addCase(connectRobot.rejected, (state, action) => {
        state.loading = false;
        state.isConnected = false;
        state.connectionStatus = 'error';
        state.lastError = { message: action.payload, timestamp: Date.now() };
      })
      
      // Disconnect robot
      .addCase(disconnectRobot.fulfilled, (state) => {
        state.isConnected = false;
        state.connectionStatus = 'disconnected';
        state.executionState.isExecuting = false;
      })
      
      // Get robot status
      .addCase(getRobotStatus.fulfilled, (state, action) => {
        const status = action.payload;
        state.telemetry = { ...state.telemetry, ...status.telemetry };
        state.safety = { ...state.safety, ...status.safety };
        state.calibration = { ...state.calibration, ...status.calibration };
      })
      
      // Fetch robot status (alias)
      .addCase(fetchRobotStatus.fulfilled, (state, action) => {
        const status = action.payload;
        state.telemetry = { ...state.telemetry, ...status.telemetry };
        state.safety = { ...state.safety, ...status.safety };
        state.calibration = { ...state.calibration, ...status.calibration };
      })
      
      // Move joint
      .addCase(moveJoint.pending, (state) => {
        state.executionState.isExecuting = true;
      })
      .addCase(moveJoint.fulfilled, (state, action) => {
        state.executionState.isExecuting = false;
        state.performance.commandCount += 1;
      })
      .addCase(moveJoint.rejected, (state, action) => {
        state.executionState.isExecuting = false;
        robotSlice.caseReducers.addError(state, { payload: action.payload });
      })
      
      // Move to position
      .addCase(moveToPosition.pending, (state) => {
        state.executionState.isExecuting = true;
      })
      .addCase(moveToPosition.fulfilled, (state, action) => {
        state.executionState.isExecuting = false;
        state.performance.commandCount += 1;
        if (action.payload.position) {
          state.currentPosition = action.payload.position;
        }
      })
      .addCase(moveToPosition.rejected, (state, action) => {
        state.executionState.isExecuting = false;
        robotSlice.caseReducers.addError(state, { payload: action.payload });
      })
      
      // Emergency stop
      .addCase(emergencyStop.fulfilled, (state) => {
        state.safety.emergencyStopActive = true;
        state.executionState.isExecuting = false;
        state.executionState.executionQueue = [];
      })
      
      // Calibration
      .addCase(calibrateRobot.pending, (state) => {
        state.calibration.calibrationProgress = 0;
      })
      .addCase(calibrateRobot.fulfilled, (state, action) => {
        state.calibration.isCalibrated = true;
        state.calibration.calibrationProgress = 100;
        state.calibration.lastCalibration = Date.now();
        state.calibration.calibrationData = action.payload;
      })
      .addCase(calibrateRobot.rejected, (state, action) => {
        state.calibration.calibrationProgress = 0;
        robotSlice.caseReducers.addError(state, { payload: action.payload });
      })
      
      // Execute code
      .addCase(executeCode.pending, (state) => {
        state.executionState.isExecuting = true;
        state.executionState.executionStartTime = Date.now();
      })
      .addCase(executeCode.fulfilled, (state, action) => {
        state.executionState.isExecuting = false;
        state.executionState.executionEndTime = Date.now();
        state.executionState.lastExecution = action.payload;
      })
      .addCase(executeCode.rejected, (state, action) => {
        state.executionState.isExecuting = false;
        state.executionState.executionEndTime = Date.now();
        robotSlice.caseReducers.addError(state, { payload: action.payload });
      });
  }
});

// Export actions
export const {
  setConnectionStatus,
  setConnectionError,
  setRobotData,
  updateCurrentPosition,
  setTargetPosition,
  setExecutionState,
  setExecutionProgress,
  setSafetyState,
  addSafetyViolation,
  clearSafetyViolations,
  setCalibrationState,
  setRobotConfig,
  incrementCommandCount,
  updatePerformanceMetrics,
  updateTelemetryStats,
  resetPerformanceMetrics,
  addError,
  removeError,
  clearErrors,
  addWarning,
  removeWarning,
  clearWarnings,
  setLoading,
  resetRobotState,
  resetTelemetry
} = robotSlice.actions;

// Selectors
export const selectIsConnected = (state) => state.robot.isConnected;
export const selectConnectionStatus = (state) => state.robot.connectionStatus;
export const selectLoadingState = (state) => state.robot.loading;
export const selectTelemetry = (state) => state.robot.telemetry;
export const selectCurrentPosition = (state) => state.robot.currentPosition;
export const selectTargetPosition = (state) => state.robot.targetPosition;
export const selectExecutionState = (state) => state.robot.executionState;
export const selectIsExecuting = (state) => state.robot.executionState.isExecuting;
export const selectExecutionProgress = (state) => state.robot.executionState.executionProgress;
export const selectSafetyState = (state) => state.robot.safety;
export const selectCalibrationState = (state) => state.robot.calibration;
export const selectRobotConfig = (state) => state.robot.robotConfig;
export const selectPerformanceMetrics = (state) => state.robot.performance;
export const selectRobotErrors = (state) => state.robot.errors;
export const selectRobotWarnings = (state) => state.robot.warnings;

// Computed selectors
export const selectRobotState = (state) => ({
  connected: state.robot.isConnected,
  status: state.robot.connectionStatus,
  telemetry: state.robot.telemetry,
  safety: state.robot.safety,
  calibration: state.robot.calibration
});

export const selectRobotHealth = (state) => {
  const { telemetry, safety, calibration, isConnected } = state.robot;
  
  if (!isConnected) return 'disconnected';
  if (safety.emergencyStopActive) return 'emergency';
  if (safety.temperatureAlarms.length > 0) return 'warning';
  if (!calibration.isCalibrated) return 'uncalibrated';
  
  const maxTemp = Math.max(...telemetry.joint_temperatures);
  if (maxTemp > 60) return 'warning';
  if (maxTemp > 70) return 'critical';
  
  return 'healthy';
};

export default robotSlice.reducer;