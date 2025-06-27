// src/contexts/ErrorContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const errorObj = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: typeof error === 'string' ? error : error.message,
      stack: error.stack,
      type: error.type || 'error',
      ...error
    };
    
    setErrors(prev => [...prev, errorObj]);
    
    // Auto-remove error after 10 seconds
    setTimeout(() => {
      removeError(errorObj.id);
    }, 10000);
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value = {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors: errors.length > 0
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;