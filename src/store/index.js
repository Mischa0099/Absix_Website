// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  persistCombineReducers,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import { useDispatch, useSelector } from 'react-redux';

// Import all slices
import authSlice from './authSlice';
import challengeSlice from './challengeSlice'; 
import robotSlice from './robotSlice';
import uiSlice from './uiSlice';

// Import middleware
import { performanceMonitor } from '../utils/performanceMonitor';

// Encryption transform for sensitive data
const encryptTransformConfig = encryptTransform({
  secretKey: process.env.REACT_APP_PERSIST_KEY || 'robotics-app-secret-key',
  onError: (error) => {
    console.error('Redux persist encryption error:', error);
  }
});

// Persist configuration for different slices
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user'], // Only persist auth tokens and user info
  transforms: [encryptTransformConfig], // Encrypt sensitive auth data
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'sidebarOpen', 'preferences'], // Persist UI preferences
};

const challengePersistConfig = {
  key: 'challenges',
  storage,
  whitelist: ['userProgress', 'completedChallenges'], // Persist progress but not current state
  blacklist: ['loading', 'error', 'currentChallenge'], // Don't persist temporary state
};

// Don't persist robot slice (real-time data should not be persisted)
const robotPersistConfig = {
  key: 'robot',
  storage,
  whitelist: ['robotConfig'], // Only persist robot configuration
  blacklist: [
    'telemetry', 
    'currentPosition', 
    'executionState', 
    'safety', 
    'performance', 
    'errors', 
    'warnings',
    'isConnected',
    'connectionStatus'
  ]
};

// Create persisted reducers
const persistedReducers = {
  auth: persistReducer(authPersistConfig, authSlice),
  challenges: persistReducer(challengePersistConfig, challengeSlice),
  robot: persistReducer(robotPersistConfig, robotSlice),
  ui: persistReducer(uiPersistConfig, uiSlice),
};

// Root persist configuration
const rootPersistConfig = {
  key: 'root',
  storage,
  version: 1,
  debug: process.env.NODE_ENV === 'development',
  migrate: (state) => {
    // Handle version migrations here
    return Promise.resolve(state);
  },
  stateReconciler: (inboundState, originalState, reducedState) => {
    // Custom state reconciler for handling conflicts
    return {
      ...reducedState,
      // Ensure robot connection state is reset on app start
      robot: {
        ...reducedState.robot,
        isConnected: false,
        connectionStatus: 'disconnected',
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
        executionState: {
          isExecuting: false,
          executionId: null,
          executionProgress: null,
          executionStartTime: null,
          executionEndTime: null,
          lastExecution: null,
          executionQueue: []
        },
        errors: [],
        warnings: [],
        lastError: null
      }
    };
  }
};

// Create root reducer with persistence
const rootReducer = persistCombineReducers(rootPersistConfig, persistedReducers);

// Custom middleware for robot telemetry and challenge tracking
const robotTelemetryMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Monitor robot telemetry for safety violations
  if (action.type === 'robot/setRobotData') {
    const state = store.getState();
    const { joint_angles, joint_temperatures, joint_currents } = action.payload;
    const { robotConfig } = state.robot;
    
    // Check joint limits
    if (joint_angles) {
      joint_angles.forEach((angle, index) => {
        const limits = robotConfig.jointLimits[index];
        if (limits && (angle < limits.min || angle > limits.max)) {
          store.dispatch({
            type: 'robot/addSafetyViolation',
            payload: [{
              joint: index + 1,
              angle,
              limit: limits,
              severity: 'error',
              message: `Joint ${index + 1} angle ${angle.toFixed(1)}° outside safe range [${limits.min}°, ${limits.max}°]`
            }]
          });
        }
      });
    }
    
    // Check temperature limits
    if (joint_temperatures) {
      joint_temperatures.forEach((temp, index) => {
        if (temp > robotConfig.maxTemperature) {
          store.dispatch({
            type: 'robot/addWarning',
            payload: {
              message: `Joint ${index + 1} temperature ${temp}°C exceeds safe limit`,
              type: 'temperature_warning',
              context: { joint: index + 1, temperature: temp }
            }
          });
        }
      });
    }
    
    // Check current limits
    if (joint_currents && robotConfig.maxCurrent) {
      joint_currents.forEach((current, index) => {
        const maxCurrent = robotConfig.maxCurrent[index] || 2.0;
        if (current > maxCurrent) {
          store.dispatch({
            type: 'robot/addWarning',
            payload: {
              message: `Joint ${index + 1} current ${current.toFixed(2)}A exceeds safe limit`,
              type: 'current_warning',
              context: { joint: index + 1, current }
            }
          });
        }
      });
    }
  }
  
  return result;
};

// Challenge progress tracking middleware
const challengeProgressMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Track challenge events for analytics
  if (action.type.startsWith('challenges/')) {
    const state = store.getState();
    const challengeEvent = {
      type: action.type,
      timestamp: new Date().toISOString(),
      payload: action.payload,
      userId: state.auth.user?.id,
      sessionId: state.challenges.session?.sessionId
    };
    
    // Record performance metric
    performanceMonitor.recordMetric('challenge_event', challengeEvent);
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeEvent)
      }).catch(error => {
        console.warn('Failed to send challenge analytics:', error);
      });
    }
  }
  
  return result;
};

// Performance monitoring middleware
const performanceMiddleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  
  const actionDuration = endTime - startTime;
  
  // Log slow actions in development
  if (process.env.NODE_ENV === 'development' && actionDuration > 10) {
    console.warn(`Slow action detected: ${action.type} took ${actionDuration.toFixed(2)}ms`);
  }
  
  // Record performance metrics for critical actions
  if (actionDuration > 5 || action.type.includes('robot/') || action.type.includes('challenges/')) {
    performanceMonitor.recordMetric('redux_action', {
      type: action.type,
      duration: actionDuration,
      timestamp: Date.now()
    });
  }
  
  return result;
};

// Error logging middleware
const errorLoggingMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    // Log Redux errors
    console.error('Redux Error:', {
      action: action.type,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Record error metric
    performanceMonitor.recordMetric('redux_error', {
      action: action.type,
      error: error.message,
      timestamp: Date.now()
    });
    
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ERROR_ENDPOINT) {
      fetch(process.env.REACT_APP_ERROR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'redux_error',
          action: action.type,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(reportError => {
        console.error('Failed to report Redux error:', reportError);
      });
    }
    
    // Re-throw the error
    throw error;
  }
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['robot.telemetry.timestamp', 'robot.executionState.executionStartTime'],
      },
      // Enable immutability check in development
      immutableCheck: {
        warnAfter: 128,
        ignoredPaths: ['robot.performance.telemetryStats']
      }
    }).concat([
      performanceMiddleware,
      robotTelemetryMiddleware,
      challengeProgressMiddleware,
      errorLoggingMiddleware,
    ]),
  
  devTools: process.env.NODE_ENV !== 'production' && {
    // Redux DevTools configuration
    name: 'Robotics Challenge App',
    trace: true,
    traceLimit: 25,
    actionCreators: {
      // Add custom action creators for debugging
    },
    serialize: {
      options: {
        undefined: true,
        function: (fn) => fn.toString()
      }
    }
  },
  
  // Preloaded state for testing or initial values
  preloadedState: process.env.NODE_ENV === 'test' ? {
    robot: {
      isConnected: false,
      connectionStatus: 'disconnected',
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
      }
    }
  } : undefined
});

// Create persistor
export const persistor = persistStore(store, null, () => {
  console.log('📦 Redux store rehydrated successfully');
  
  // Log store statistics
  const state = store.getState();
  console.log('📊 Store statistics:', {
    authConnected: !!state.auth.token,
    robotConfigured: !!state.robot.robotConfig,
    challengesLoaded: Object.keys(state.challenges.challengeDetails || {}).length,
    uiTheme: state.ui.theme
  });
});

// Store enhancement for development
if (process.env.NODE_ENV === 'development') {
  // Enable hot reloading for reducers
  if (module.hot) {
    module.hot.accept('./authSlice', () => {
      store.replaceReducer(rootReducer);
    });
    module.hot.accept('./challengeSlice', () => {
      store.replaceReducer(rootReducer);
    });
    module.hot.accept('./robotSlice', () => {
      store.replaceReducer(rootReducer);
    });
    module.hot.accept('./uiSlice', () => {
      store.replaceReducer(rootReducer);
    });
  }
  
  // Expose store to window for debugging
  window.__REDUX_STORE__ = store;
  
  // Log all actions in development
  store.subscribe(() => {
    const state = store.getState();
    
    // Monitor store size to prevent memory leaks
    const stateSize = JSON.stringify(state).length;
    if (stateSize > 1024 * 1024) { // 1MB
      console.warn('Redux store size is large:', (stateSize / 1024 / 1024).toFixed(2) + 'MB');
    }
  });
}

// Performance monitoring for store operations
const storePerformanceMonitor = {
  start: performance.now(),
  
  // Monitor dispatch performance
  monitorDispatch: (action) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 10) {
        performanceMonitor.recordMetric('slow_dispatch', {
          action: action.type,
          duration,
          timestamp: Date.now()
        });
      }
    };
  }
};

// Wrap dispatch with performance monitoring
const originalDispatch = store.dispatch;
store.dispatch = (action) => {
  const endMonitoring = storePerformanceMonitor.monitorDispatch(action);
  const result = originalDispatch(action);
  endMonitoring();
  return result;
};

// JavaScript hooks (no TypeScript types)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Export selectors for convenience
export const selectors = {
  // Auth selectors
  selectIsAuthenticated: (state) => !!state.auth.token,
  selectCurrentUser: (state) => state.auth.user,
  selectAuthLoading: (state) => state.auth.loading,
  
  // Robot selectors
  selectIsRobotConnected: (state) => state.robot.isConnected,
  selectRobotTelemetry: (state) => state.robot.telemetry,
  selectRobotConfig: (state) => state.robot.robotConfig,
  selectIsExecuting: (state) => state.robot.executionState.isExecuting,
  selectRobotErrors: (state) => state.robot.errors,
  selectRobotHealth: (state) => {
    const { telemetry, safety, calibration, isConnected } = state.robot;
    
    if (!isConnected) return 'disconnected';
    if (safety.emergencyStopActive) return 'emergency';
    if (safety.temperatureAlarms.length > 0) return 'warning';
    if (!calibration.isCalibrated) return 'uncalibrated';
    
    const maxTemp = Math.max(...telemetry.joint_temperatures);
    if (maxTemp > 60) return 'warning';
    if (maxTemp > 70) return 'critical';
    
    return 'healthy';
  },
  
  // Challenge selectors
  selectCurrentChallenge: (state) => state.challenges.currentChallenge,
  selectChallenge1State: (state) => state.challenges.challenge1,
  selectUserProgress: (state) => state.challenges.userProgress,
  selectChallengeLoading: (state) => state.challenges.loading,
  
  // UI selectors
  selectTheme: (state) => state.ui.theme,
  selectSidebarOpen: (state) => state.ui.sidebarOpen,
  selectNotifications: (state) => state.ui.notifications,
  
  // Computed selectors
  selectChallengeProgress: (state) => {
    const { challenge1, userProgress } = state.challenges;
    return {
      currentScore: challenge1.score,
      totalScore: userProgress.totalScore,
      completionRate: (userProgress.challengesCompleted / 15) * 100, // Assuming 15 total challenges
      currentStreak: userProgress.streakCount,
      timeSpent: challenge1.timeElapsed,
      accuracy: challenge1.accuracy
    };
  }
};

// Store initialization complete
console.log('🏪 Redux store configured successfully');
console.log('🔄 Persistence enabled for auth, challenges, robot config, and UI');
console.log('🛡️ Security: Sensitive data encrypted');
console.log('📊 Monitoring: Performance and error tracking enabled');

export default store;