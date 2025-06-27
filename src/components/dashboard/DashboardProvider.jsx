// =================== DashboardProvider.jsx ===================
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChallenges } from '../../store/challengeSlice';
import { useWebSocket } from '../../hooks/useWebSocket';

// Dashboard Context
const DashboardContext = createContext();

// Dashboard state reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_REFRESH_TIMESTAMP':
      return { ...state, lastRefresh: action.payload };
    case 'SET_AUTO_REFRESH':
      return { ...state, autoRefresh: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    case 'UPDATE_LIVE_DATA':
      return { ...state, liveData: { ...state.liveData, ...action.payload } };
    default:
      return state;
  }
};

// Initial dashboard state
const initialState = {
  loading: false,
  error: null,
  lastRefresh: new Date(),
  autoRefresh: true,
  notification: null,
  liveData: {
    robotHeartbeat: null,
    activeUsers: 0,
    systemStatus: 'unknown'
  }
};

// Dashboard Provider Component
export const DashboardProvider = ({ children }) => {
  const [dashboardState, dashboardDispatch] = useReducer(dashboardReducer, initialState);
  const reduxDispatch = useDispatch();
  const { challenges, loading: challengesLoading } = useSelector(state => state.challenges);
  const { connected: robotConnected } = useSelector(state => state.robot);
  const { subscribeToUpdates, isConnected } = useWebSocket();

  // Auto-refresh logic
  useEffect(() => {
    if (dashboardState.autoRefresh) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [dashboardState.autoRefresh]);

  // WebSocket subscription for live updates
  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribeToUpdates((data) => {
        dashboardDispatch({
          type: 'UPDATE_LIVE_DATA',
          payload: {
            robotHeartbeat: data.robotHeartbeat,
            activeUsers: data.activeUsers,
            systemStatus: data.systemStatus
          }
        });
      });

      return unsubscribe;
    }
  }, [isConnected, subscribeToUpdates]);

  // Dashboard actions
  const refreshDashboard = async () => {
    try {
      dashboardDispatch({ type: 'SET_LOADING', payload: true });
      await reduxDispatch(fetchChallenges()).unwrap();
      dashboardDispatch({ type: 'SET_REFRESH_TIMESTAMP', payload: new Date() });
      dashboardDispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dashboardDispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dashboardDispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const showNotification = (message, type = 'info') => {
    dashboardDispatch({
      type: 'SET_NOTIFICATION',
      payload: { message, type, timestamp: new Date() }
    });

    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      dashboardDispatch({ type: 'CLEAR_NOTIFICATION' });
    }, 5000);
  };

  const toggleAutoRefresh = () => {
    dashboardDispatch({
      type: 'SET_AUTO_REFRESH',
      payload: !dashboardState.autoRefresh
    });
  };

  const clearError = () => {
    dashboardDispatch({ type: 'SET_ERROR', payload: null });
  };

  // Context value
  const contextValue = {
    // State
    ...dashboardState,
    challengesLoading,
    robotConnected,
    challenges,
    
    // Actions
    refreshDashboard,
    showNotification,
    toggleAutoRefresh,
    clearError
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};