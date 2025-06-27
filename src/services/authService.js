// src/services/authService.js
import api from './api';

const authService = {
  // Login user
  login: async (username, password) => {
    try {
      console.log('🔐 Auth Service: Starting login...');
      
      // Send as form data to match OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('🔐 Auth Service: Login successful');
      
      // Store the token and user data
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('🔐 Auth Service: Login failed:', error.response?.data?.detail || error.message);
      throw error;
    }
  },

  // Register user
  register: async (username, password, email = '') => {
    try {
      console.log('👤 Auth Service: Starting registration...');
      
      // Send as form data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      if (email) {
        formData.append('email', email);
      }
      
      const response = await api.post('/api/v1/auth/register', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('👤 Auth Service: Registration successful');
      
      // Store the token and user data
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('👤 Auth Service: Registration failed:', error.response?.data?.detail || error.message);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      console.log('🚪 Auth Service: Logging out...');
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('🚪 Auth Service: Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🚪 Auth Service: Cleanup completed');
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response;
    } catch (error) {
      console.error('👤 Auth Service: Get current user failed:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/v1/auth/profile', userData);
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('👤 Auth Service: Update profile failed:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response;
    } catch (error) {
      console.error('🔐 Auth Service: Change password failed:', error);
      throw error;
    }
  },

  // Utility functions
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Token validation
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenPayload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
};

export default authService;