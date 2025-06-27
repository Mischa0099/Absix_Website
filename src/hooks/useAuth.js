// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser, clearError } from '../store/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(state => state.auth);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser && !user) {
        try {
          // Validate token
          if (authService.isTokenValid()) {
            const userData = JSON.parse(savedUser);
            console.log('🔐 useAuth: Restoring user session');
            
            // Optionally refresh user data from server
            // await dispatch(getCurrentUser()).unwrap();
          } else {
            console.log('🔐 useAuth: Token expired, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('🔐 useAuth: Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuthStatus();
  }, [user, dispatch]);

  // Login function
  const login = useCallback(async (username, password) => {
    try {
      console.log('🔐 useAuth: Attempting login...');
      await dispatch(loginUser({ username, password })).unwrap();
      console.log('🔐 useAuth: Login successful');
      return true;
    } catch (error) {
      console.error('🔐 useAuth: Login failed:', error);
      return false;
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async (username, password, email) => {
    try {
      console.log('🔐 useAuth: Attempting registration...');
      await dispatch(registerUser({ username, password, email })).unwrap();
      console.log('🔐 useAuth: Registration successful');
      return true;
    } catch (error) {
      console.error('🔐 useAuth: Registration failed:', error);
      return false;
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log('🔐 useAuth: Logging out...');
      await dispatch(logoutUser()).unwrap();
      console.log('🔐 useAuth: Logout successful');
      return true;
    } catch (error) {
      console.error('🔐 useAuth: Logout failed:', error);
      return false;
    }
  }, [dispatch]);

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Token validation
  const isTokenValid = useCallback(() => {
    return authService.isTokenValid();
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearAuthError,
    isTokenValid
  };
};
