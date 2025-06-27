// src/utils/helpers.js

// Math utility functions
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const clampAngle = (angle, min = -Math.PI, max = Math.PI) => {
  while (angle > max) angle -= 2 * Math.PI;
  while (angle < min) angle += 2 * Math.PI;
  return angle;
};

// Conversion functions
export const degreesToRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const radiansToDegrees = (radians) => {
  return (radians * 180) / Math.PI;
};

// Aliases for consistency
export const degToRad = degreesToRadians;
export const radToDeg = radiansToDegrees;

// Raw position conversion functions
export const degreesToPositionRaw = (degrees) => {
  // Convert degrees to raw servo position (0-1023)
  return Math.round(((degrees + 150) / 300) * 1023);
};

export const rawToDegrees = (raw) => {
  // Convert raw servo position to degrees
  return ((raw / 1023) * 300) - 150;
};

export const degreesToVelocityRaw = (degreesPerSec) => {
  // Convert degrees/sec to raw velocity units
  return Math.round(degreesPerSec * 2.84);
};

// Format numbers with specified decimal places
export const formatNumber = (num, decimals = 2) => {
  if (typeof num !== 'number' || isNaN(num)) return '0.00';
  return num.toFixed(decimals);
};

// Time and date utilities
export const now = () => Date.now();

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Logging utilities
export const debugLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

export const errorLog = (message, error) => {
  console.error(`[ERROR] ${message}`, error);
};

// Challenge and scoring utilities
export const calculateAccuracy = (targetAngles, actualAngles, tolerance = 5) => {
  if (!targetAngles || !actualAngles || targetAngles.length !== actualAngles.length) {
    return 0;
  }
  
  const errors = targetAngles.map((target, index) => 
    Math.abs(target - actualAngles[index])
  );
  
  const accurateJoints = errors.filter(error => error <= tolerance).length;
  return (accurateJoints / targetAngles.length) * 100;
};

export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.min((completed / total) * 100, 100);
};

// Generate random angles for challenges
export const generateRandomAngles = (type = 'absolute') => {
  if (type === 'absolute') {
    const firstAngle = 5 * Math.floor(Math.random() * 37); // 0-180 in steps of 5
    let secondAngle, thirdAngle;
    
    if (firstAngle > 0) {
      const minSecond = Math.max(-90, firstAngle - 90);
      const maxSecond = Math.min(90, firstAngle + 90);
      secondAngle = 5 * Math.floor(Math.random() * ((maxSecond - minSecond) / 5 + 1)) + minSecond;
      
      if (secondAngle > -90) {
        const minThird = Math.max(-90, secondAngle - 90);
        const maxThird = Math.min(90, secondAngle + 90);
        thirdAngle = 5 * Math.floor(Math.random() * ((maxThird - minThird) / 5 + 1)) + minThird;
      } else {
        secondAngle = 90;
        thirdAngle = 75;
      }
    } else {
      secondAngle = 5 * (Math.floor(Math.random() * 37) - 18); // -90 to 90
      thirdAngle = 5 * (Math.floor(Math.random() * 37) - 18); // -90 to 90
    }
    
    return [firstAngle, secondAngle, thirdAngle];
  } else {
    // Relative angles
    return [
      5 * Math.floor(Math.random() * 37),      // 0-180 in steps of 5
      5 * (Math.floor(Math.random() * 37) - 18), // -90-90 in steps of 5
      5 * (Math.floor(Math.random() * 37) - 18)  // -90-90 in steps of 5
    ];
  }
};

// UI and display utilities
export const getScoreColor = (score) => {
  if (score >= 90) return '#4CAF50'; // Green
  if (score >= 75) return '#2196F3'; // Blue
  if (score >= 60) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: '#4CAF50',
    intermediate: '#FF9800', 
    advanced: '#F44336',
    expert: '#9C27B0'
  };
  return colors[difficulty?.toLowerCase()] || '#888888';
};

export const getRank = (challengesCompleted, totalScore) => {
  if (challengesCompleted >= 14) return 'Robotics Master';
  if (challengesCompleted >= 10) return 'Robotics Jedi';
  if (challengesCompleted >= 8) return 'Robotics Specialist';
  if (challengesCompleted >= 5) return 'Robotics Beginner';
  return 'Rising Roboticist';
};

export const getRankColor = (rank) => {
  const colors = {
    'Robotics Master': '#FFD700',
    'Robotics Jedi': '#C0C0C0',
    'Robotics Specialist': '#CD7F32',
    'Robotics Beginner': '#4CAF50',
    'Rising Roboticist': '#2196F3'
  };
  return colors[rank] || '#888888';
};

export const getRankInfo = (challengesCompleted, totalScore) => {
  const rank = getRank(challengesCompleted, totalScore);
  const color = getRankColor(rank);
  return { rank, color };
};

// Validation utilities
export const validateJointAngles = (angles) => {
  if (!Array.isArray(angles) || angles.length !== 3) return false;
  
  const limits = {
    min: [-Math.PI, -Math.PI/2, -Math.PI/2],
    max: [Math.PI, Math.PI/2, Math.PI/2]
  };
  
  return angles.every((angle, index) => 
    typeof angle === 'number' && 
    !isNaN(angle) &&
    angle >= limits.min[index] && 
    angle <= limits.max[index]
  );
};

// Default export for backward compatibility
const helpers = {
  clamp,
  clampAngle,
  degreesToRadians,
  radiansToDegrees,
  degToRad,
  radToDeg,
  degreesToPositionRaw,
  rawToDegrees, 
  degreesToVelocityRaw,
  formatNumber,
  now,
  formatDate,
  formatDuration,
  debounce,
  throttle,
  debugLog,
  errorLog,
  calculateAccuracy,
  calculateProgress,
  generateRandomAngles,
  getScoreColor,
  getDifficultyColor,
  getRank,
  getRankColor,
  getRankInfo,
  validateJointAngles
};

export default helpers;