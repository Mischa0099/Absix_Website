// src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Theme settings
  theme: 'dark', // 'light' | 'dark' | 'auto'
  
  // Layout settings
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // User preferences
  preferences: {
    notifications: true,
    sounds: true,
    animations: true,
    autoSave: true,
    units: 'metric', // 'metric' | 'imperial'
    language: 'en',
    debugMode: false
  },
  
  // Notifications
  notifications: [],
  
  // Modal and dialog states
  modals: {
    settingsOpen: false,
    helpOpen: false,
    aboutOpen: false,
    confirmDialogOpen: false,
    confirmDialogData: null
  },
  
  // Loading states for UI components
  loadingStates: {
    dashboard: false,
    challenges: false,
    robot: false,
    profile: false
  },
  
  // Error states
  errors: {
    dashboard: null,
    challenges: null,
    robot: null,
    profile: null
  },
  
  // View states
  views: {
    currentPage: 'dashboard',
    previousPage: null,
    breadcrumbs: [],
    activeTab: 0
  },
  
  // Device and responsive settings
  device: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Sidebar management
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Preferences
    setPreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
        ...action.payload
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    // Modal management
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      state.modals[modalName] = true;
      if (data && modalName === 'confirmDialogOpen') {
        state.modals.confirmDialogData = data;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
      if (modalName === 'confirmDialogOpen') {
        state.modals.confirmDialogData = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        if (modalName !== 'confirmDialogData') {
          state.modals[modalName] = false;
        }
      });
      state.modals.confirmDialogData = null;
    },
    
    // Loading states
    setLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loadingStates[component] = loading;
    },
    setLoadingStates: (state, action) => {
      state.loadingStates = { ...state.loadingStates, ...action.payload };
    },
    
    // Error states
    setError: (state, action) => {
      const { component, error } = action.payload;
      state.errors[component] = error;
    },
    clearError: (state, action) => {
      const component = action.payload;
      state.errors[component] = null;
    },
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(component => {
        state.errors[component] = null;
      });
    },
    
    // View management
    setCurrentPage: (state, action) => {
      state.views.previousPage = state.views.currentPage;
      state.views.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.views.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.views.breadcrumbs.push(action.payload);
    },
    setActiveTab: (state, action) => {
      state.views.activeTab = action.payload;
    },
    
    // Device management
    setDevice: (state, action) => {
      state.device = { ...state.device, ...action.payload };
    },
    updateScreenSize: (state, action) => {
      const { width, height } = action.payload;
      state.device.screenWidth = width;
      state.device.screenHeight = height;
      state.device.isMobile = width < 768;
      state.device.isTablet = width >= 768 && width < 1024;
      state.device.isDesktop = width >= 1024;
    },
    
    // Utility actions
    resetUI: (state) => {
      return {
        ...initialState,
        device: state.device // Preserve device info
      };
    }
  }
});

export const {
  // Theme
  setTheme,
  toggleTheme,
  
  // Sidebar
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  
  // Preferences
  setPreference,
  setPreferences,
  resetPreferences,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading
  setLoading,
  setLoadingStates,
  
  // Errors
  setError,
  clearError,
  clearAllErrors,
  
  // Views
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  setActiveTab,
  
  // Device
  setDevice,
  updateScreenSize,
  
  // Utility
  resetUI
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectPreferences = (state) => state.ui.preferences;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectModals = (state) => state.ui.modals;
export const selectLoadingStates = (state) => state.ui.loadingStates;
export const selectErrors = (state) => state.ui.errors;
export const selectViews = (state) => state.ui.views;
export const selectDevice = (state) => state.ui.device;
export const selectIsMobile = (state) => state.ui.device.isMobile;
export const selectIsTablet = (state) => state.ui.device.isTablet;
export const selectIsDesktop = (state) => state.ui.device.isDesktop;

export default uiSlice.reducer;