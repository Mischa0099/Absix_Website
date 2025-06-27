
// src/utils/validation.js
export const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return 'Username is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password.length > 50) {
    return 'Password must be less than 50 characters';
  }
  
  return null;
};

export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return null; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validateJointAngle = (angle, min = -180, max = 180) => {
  const numAngle = parseFloat(angle);
  
  if (isNaN(numAngle)) {
    return 'Angle must be a valid number';
  }
  
  if (numAngle < min || numAngle > max) {
    return `Angle must be between ${min}° and ${max}°`;
  }
  
  return null;
};

export const validateSpeed = (speed) => {
  const numSpeed = parseFloat(speed);
  
  if (isNaN(numSpeed)) {
    return 'Speed must be a valid number';
  }
  
  if (numSpeed < 1 || numSpeed > 100) {
    return 'Speed must be between 1% and 100%';
  }
  
  return null;
};
