// src/challenges/challengeRegistry.js

// Import all challenge components
import Challenge1 from './Challenge1';
// import Challenge2 from './Challenge2';
// import Challenge3 from './Challenge3';
// Add new challenges here as you create them

/**
 * Challenge Registry - Add new challenges here
 * 
 * To add a new challenge:
 * 1. Create your challenge component in this folder (e.g., Challenge4.jsx)
 * 2. Import it above
 * 3. Add an entry to the CHALLENGE_COMPONENTS object below
 * 4. That's it! The system will automatically handle routing and display
 */

export const CHALLENGE_COMPONENTS = {
  'C1': {
    component: Challenge1,
    title: 'Robot Configuration',
    description: 'Master robot joint control with manual positioning',
    type: 'hardware',
    requiresWebSerial: true,
    estimatedTime: 15,
    difficulty: 'beginner'
  },
  // 'C2': {
  //   component: Challenge2,
  //   title: 'Controls Quiz',
  //   description: 'Test your theoretical knowledge of control systems',
  //   type: 'quiz',
  //   requiresWebSerial: false,
  //   estimatedTime: 10,
  //   difficulty: 'beginner'
  // },
  // 'C3': {
  //   component: Challenge3,
  //   title: 'PD Gain Tuning',
  //   description: 'Learn controller design by tuning PD gains',
  //   type: 'hardware',
  //   requiresWebSerial: true,
  //   estimatedTime: 20,
  //   difficulty: 'beginner'
  // },
  // Add more challenges here...
};

/**
 * Get challenge component by ID
 * @param {string} challengeId - The challenge ID (e.g., 'C1', 'C2')
 * @returns {Object|null} Challenge configuration object or null if not found
 */
export const getChallengeComponent = (challengeId) => {
  return CHALLENGE_COMPONENTS[challengeId] || null;
};

/**
 * Get all available challenges
 * @returns {Array} Array of challenge IDs and their configurations
 */
export const getAllChallenges = () => {
  return Object.entries(CHALLENGE_COMPONENTS).map(([id, config]) => ({
    id,
    ...config
  }));
};

/**
 * Check if challenge exists
 * @param {string} challengeId - The challenge ID
 * @returns {boolean} True if challenge exists, false otherwise
 */
export const challengeExists = (challengeId) => {
  return challengeId in CHALLENGE_COMPONENTS;
};

export default CHALLENGE_COMPONENTS;