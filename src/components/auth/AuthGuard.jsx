// src/components/auth/AuthGuard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, token } = useSelector(state => state.auth);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated (either by token or isAuthenticated flag)
  const userIsAuthenticated = isAuthenticated || !!token;

  // Redirect to login if not authenticated
  if (!userIsAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

// Export as both named and default export for compatibility
export { AuthGuard };
export default AuthGuard;