// API Configuration
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CHALLENGES: '/api/challenges',
  ROBOT: '/api/robot',
  LEADERBOARD: '/api/leaderboard',
  USER: '/api/user'
};

// Challenge Types
export const CHALLENGE_TYPES = {
  MANUAL_MOVEMENT: 'manual_movement',
  PD_CONTROL: 'pd_control',
  QUIZ: 'quiz',
  WORKSPACE: 'workspace',
  KINEMATICS: 'kinematics'
};

// Connection Status
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Joint Limits
export const JOINT_LIMITS = [
  { min: -180, max: 180 }, // Joint 1
  { min: -90, max: 90 },   // Joint 2
  { min: -90, max: 90 }    // Joint 3
];

// Rank Thresholds
export const RANK_THRESHOLDS = {
  BEGINNER: 0,
  INTERMEDIATE: 60,
  ADVANCED: 70,
  EXPERT: 80,
  MASTER: 90
};

// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  SATISFACTORY: 70,
  NEEDS_IMPROVEMENT: 60,
  POOR: 0
};

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ROBOT_STATUS: 'robot_status',
  MOTOR_UPDATE: 'motor_update',
  CHALLENGE_START: 'challenge_start',
  CHALLENGE_END: 'challenge_end',
  EMERGENCY_STOP: 'emergency_stop'
};

// Robot Commands (missing export that was causing errors)
export const ROBOT_COMMANDS = {
  GET_POSITION: 'get_position',
  SET_POSITION: 'set_position',
  GET_VELOCITY: 'get_velocity',
  SET_VELOCITY: 'set_velocity',
  ENABLE_TORQUE: 'enable_torque',
  DISABLE_TORQUE: 'disable_torque',
  CALIBRATE: 'calibrate',
  EMERGENCY_STOP: 'emergency_stop'
};

// Alias for backward compatibility
export const COMMANDS = ROBOT_COMMANDS;

// Robot Specifications (missing export that was causing errors)
export const ROBOT_SPECS = {
  linkLengths: [0.10, 0.07, 0.05], // meters
  jointLimits: JOINT_LIMITS,
  maxVelocity: 50, // degrees per second
  precision: 0.1, // degrees
  positionRange: 4096, // raw position units (0-4095)
  velocityRange: 1023, // raw velocity units
  maxDegreesPerSecond: 114, // maximum degrees per second
  
  // Motor specifications
  motors: [
    {
      id: 1,
      name: 'Base Joint',
      type: 'AX-12A',
      positionRange: 4096,
      velocityRange: 1023,
      maxDegreesPerSecond: 114
    },
    {
      id: 2,
      name: 'Shoulder Joint',
      type: 'AX-12A',
      positionRange: 4096,
      velocityRange: 1023,
      maxDegreesPerSecond: 114
    },
    {
      id: 3,
      name: 'Elbow Joint',
      type: 'AX-12A',
      positionRange: 4096,
      velocityRange: 1023,
      maxDegreesPerSecond: 114
    }
  ],
  
  // Communication settings
  baudRate: 1000000,
  protocol: 'Dynamixel 1.0',
  
  // Safety limits
  temperatureLimit: 70, // Celsius
  voltageRange: { min: 9.0, max: 12.0 }, // Volts
  
  // Workspace limits (approximate)
  workspace: {
    radius: 0.22, // meters
    height: { min: -0.1, max: 0.2 } // meters
  }
};

// Default robot configuration
export const DEFAULT_ROBOT_CONFIG = {
  homePosition: [0, 0, 0], // degrees
  safePosition: [0, -45, 45], // degrees
  calibrationSequence: [
    { joint: 1, position: 0, duration: 2000 },
    { joint: 2, position: 0, duration: 2000 },
    { joint: 3, position: 0, duration: 2000 }
  ]
};

// Control parameters
export const CONTROL_PARAMS = {
  PD: {
    KP_RANGE: { min: 0, max: 16500, default: 32 },
    KD_RANGE: { min: 0, max: 10.0, default: 0.1 },
    SETTLING_TIME_TARGET: 3.0, // seconds
    OVERSHOOT_TARGET: 20.0, // percent
    STEADY_STATE_ERROR_TARGET: 0.02 // radians
  }
};

// Challenge configurations
export const CHALLENGE_CONFIG = {
  C1: {
    TOLERANCE_DEGREES: 10,
    MAX_SCORE: 100,
    PASSING_SCORE: 60,
    TASKS: 3
  },
  C2: {
    QUESTION_COUNT: 20,
    TIME_LIMIT: 1200, // 20 minutes in seconds
    PASSING_SCORE: 80
  },
  C3: {
    TIME_LIMIT: 1500, // 25 minutes
    PERFORMANCE_WEIGHTS: {
      settling_time: 0.4,
      overshoot: 0.3,
      steady_state_error: 0.3
    }
  }
};

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  REFRESH_INTERVAL: 1000,
  CHART_MAX_POINTS: 100
};

// Error messages
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to robot',
  COMMAND_TIMEOUT: 'Command timed out',
  INVALID_ANGLE: 'Invalid joint angle',
  EMERGENCY_STOP: 'Emergency stop activated',
  HARDWARE_ERROR: 'Hardware error detected'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CONNECTION_ESTABLISHED: 'Robot connected successfully',
  CHALLENGE_COMPLETED: 'Challenge completed!',
  CALIBRATION_SUCCESS: 'Robot calibrated successfully',
  POSITION_REACHED: 'Target position reached'
};