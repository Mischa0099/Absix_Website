// src/utils/testUtils.js
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { theme } from '../styles/themes';

// Mock store for testing
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null }, action) => state,
      robot: (state = { 
        isConnected: false, 
        telemetry: { joint_angles: [0, 0, 0] },
        executionState: { isExecuting: false }
      }, action) => state,
      challenges: (state = { 
        challenge1: { score: 0, accuracy: 100, attempts: 0 },
        userProgress: { challengesCompleted: 0, totalScore: 0 }
      }, action) => state,
      ui: (state = { theme: 'light', notifications: [] }, action) => state,
      ...initialState
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false // Disable for testing
    })
  });
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialState = {},
    store = createMockStore(initialState),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Test data generators
export const generateMockTelemetryData = (overrides = {}) => ({
  joint_angles: [0, 0, 0],
  joint_velocities: [0, 0, 0],
  joint_currents: [0.5, 0.4, 0.3],
  joint_temperatures: [25, 26, 24],
  end_effector_position: { x: 0, y: 0, z: 0 },
  system_status: 'idle',
  timestamp: new Date().toISOString(),
  ...overrides
});

export const generateMockChallengeState = (overrides = {}) => ({
  isStarted: false,
  score: 0,
  accuracy: 100,
  attempts: 0,
  bestScore: 0,
  timeElapsed: 0,
  targetPosition: [30, 0, 0],
  currentError: 0,
  isCompleted: false,
  ...overrides
});

// Wait utilities for async testing
export const waitForRobotConnection = async (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkConnection = () => {
      if (mockRobotService.isConnected) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Robot connection timeout'));
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    checkConnection();
  });
};

export const waitForCodeExecution = async (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkExecution = () => {
      if (!mockRobotService.isExecuting) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Code execution timeout'));
      } else {
        setTimeout(checkExecution, 100);
      }
    };
    checkExecution();
  });
};

// Mock services for testing
export const mockRobotService = new MockRobotService();
export const mockWebSocketService = new MockWebSocketService();

// Test scenarios
export const testScenarios = {
  // Successful challenge completion
  successfulChallenge: {
    robotConnected: true,
    targetPosition: [30, 0, 0],
    codeExecution: {
      success: true,
      finalPosition: [29.8, 0.1, -0.2],
      positionError: 0.2
    },
    expectedScore: 95
  },

  // Failed challenge attempt
  failedChallenge: {
    robotConnected: true,
    targetPosition: [30, 0, 0],
    codeExecution: {
      success: true,
      finalPosition: [25, 5, 10],
      positionError: 10
    },
    expectedScore: 50
  },

  // Connection error
  connectionError: {
    robotConnected: false,
    error: 'Robot not connected'
  },

  // Hardware malfunction
  hardwareMalfunction: {
    robotConnected: true,
    telemetryIssues: true,
    temperatureAlarm: true,
    jointLimitViolation: true
  }
};