import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { errorLog, debugLog } from '../utils/helpers';

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, refresh_token, user, expires_at } = response.data;

      debugLog('Login successful', { user: user.email });

      return {
        token,
        refreshToken: refresh_token,
        user,
        expiresAt: expires_at,
      };
    } catch (error) {
      errorLog('Login failed', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

      debugLog('Registration successful', { email: userData.email });

      return response.data;
    } catch (error) {
      errorLog('Registration failed', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  async logout(token) {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      debugLog('Logout successful');
    } catch (error) {
      errorLog('Logout error', error);
      // Don't throw error - logout should always succeed locally
    }
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });

      const { token, refresh_token, expires_at } = response.data;

      debugLog('Token refresh successful');

      return {
        token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
      };
    } catch (error) {
      errorLog('Token refresh failed', error);
      throw new Error('Session expired');
    }
  },

  // Get user profile
  async getProfile(token) {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      debugLog('Profile loaded successfully');

      return response.data;
    } catch (error) {
      errorLog('Failed to load profile', error);
      throw new Error(error.response?.data?.message || 'Failed to load profile');
    }
  },

  // Update user profile
  async updateProfile(token, profileData) {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      debugLog('Profile updated successfully');

      return response.data;
    } catch (error) {
      errorLog('Failed to update profile', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/password-reset-request', {
        email,
      });

      debugLog('Password reset requested for', email);

      return response.data;
    } catch (error) {
      errorLog('Password reset request failed', error);
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  },

  // Reset password with token
  async resetPassword(resetToken, newPassword) {
    try {
      const response = await api.post('/auth/password-reset', {
        token: resetToken,
        password: newPassword,
      });

      debugLog('Password reset successful');

      return response.data;
    } catch (error) {
      errorLog('Password reset failed', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  // Verify email
  async verifyEmail(verificationToken) {
    try {
      const response = await api.post('/auth/verify-email', {
        token: verificationToken,
      });

      debugLog('Email verification successful');

      return response.data;
    } catch (error) {
      errorLog('Email verification failed', error);
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    return !!(token && refreshToken);
  },

  // Get stored auth token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },
};