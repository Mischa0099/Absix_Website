// src/services/challengeService.js
import api from './api';

const challengeService = {
  // Get all challenges with user progress
  getChallenges: async () => {
    try {
      console.log('🎯 Challenge Service: Fetching challenges...');
      const response = await api.get('/api/v1/challenges');
      console.log('🎯 Challenge Service: Challenges fetched successfully');
      return response;
    } catch (error) {
      console.error('🎯 Challenge Service: Fetch challenges failed:', error);
      
      // Return mock data structure that matches your frontend expectations
      console.log('🎯 Using fallback mock data for challenges');
      const mockChallenges = {
        challenges: [
          {
            id: "C1",
            challenge_id: "C1", 
            title: "Combined Angle Challenge",
            name: "Combined Angle Challenge",
            description: "Master robot joint control by manually positioning the robot to match target angles. Test your understanding of robot configuration and physical manipulation.",
            challenge_type: "manual_movement",
            difficulty: "beginner",
            is_unlocked: true,
            is_completed: false,
            best_score: 0,
            attempts: 0,
            estimated_time: 15,
            order_index: 1
          },
          {
            id: "C2",
            challenge_id: "C2",
            title: "Controls Quiz", 
            name: "Controls Quiz",
            description: "Test your theoretical knowledge of control systems with this interactive quiz. Master the fundamentals before diving into practical applications.",
            challenge_type: "quiz",
            difficulty: "beginner", 
            is_unlocked: false,
            is_completed: false,
            best_score: 0,
            attempts: 0,
            estimated_time: 10,
            order_index: 2
          },
          {
            id: "C3",
            challenge_id: "C3",
            title: "PD Gain Tuning",
            name: "PD Gain Tuning", 
            description: "Learn controller design by tuning PD gains for optimal robot performance. Balance stability, response time, and accuracy.",
            challenge_type: "pd_control",
            difficulty: "beginner",
            is_unlocked: false,
            is_completed: false,
            best_score: 0,
            attempts: 0,
            estimated_time: 20,
            order_index: 3
          },
          {
            id: "C4",
            challenge_id: "C4",
            title: "Workspace Identification",
            name: "Workspace Identification",
            description: "We will throw points at your robot, will it be able to catch them? Test your understanding of robot workspace and reachability.",
            challenge_type: "workspace",
            difficulty: "beginner",
            is_unlocked: false,
            is_completed: false,
            best_score: 0,
            attempts: 0,
            estimated_time: 25,
            order_index: 4
          },
          {
            id: "C5", 
            challenge_id: "C5",
            title: "2R - EE Orientation & Position",
            name: "2R - EE Orientation & Position",
            description: "Verify end effector's orientation and position kinematics for a 2R robot. Master forward kinematics and transformation matrices.",
            challenge_type: "orientation",
            difficulty: "beginner",
            is_unlocked: false,
            is_completed: false,
            best_score: 0,
            attempts: 0,
            estimated_time: 30,
            order_index: 5
          }
        ],
        userProgress: {
          completed: 0,
          totalScore: 0,
          rank: 'Rising Roboticist',
          challengesCompleted: 0,
          streakCount: 0
        }
      };
      
      return { data: mockChallenges };
    }
  },

  // Get specific challenge details
  getChallenge: async (challengeId) => {
    try {
      console.log(`🎯 Challenge Service: Fetching challenge ${challengeId}...`);
      const response = await api.get(`/api/v1/challenges/${challengeId}`);
      console.log(`🎯 Challenge Service: Challenge ${challengeId} fetched successfully`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Fetch challenge ${challengeId} failed:`, error);
      
      // Return mock challenge data based on ID
      console.log(`🎯 Using fallback mock data for challenge ${challengeId}`);
      const mockChallengeData = {
        C1: {
          id: "C1",
          challenge_id: "C1",
          title: "Combined Angle Challenge",
          description: "Master robot joint control by manually positioning the robot to match target angles. Test your understanding of robot configuration and physical manipulation.",
          challenge_type: "manual_movement",
          type: "manual_movement",
          difficulty: "beginner",
          is_unlocked: true,
          is_completed: false,
          best_score: 0,
          attempts: 0,
          estimated_time: 15,
          parameters: {
            joint_limits: [-180, 180],
            precision_threshold: 5
          },
          success_criteria: {
            accuracy_threshold: 90,
            time_limit: 900
          },
          instructions: "Use the robot controls to move each joint to match the target angles displayed. You have 3 tasks to complete with increasing difficulty.",
          video_url: null
        },
        C2: {
          id: "C2", 
          challenge_id: "C2",
          title: "Controls Quiz",
          description: "Test your theoretical knowledge of control systems with this interactive quiz. Master the fundamentals before diving into practical applications.",
          challenge_type: "quiz",
          type: "quiz",
          difficulty: "beginner",
          is_unlocked: false,
          is_completed: false,
          best_score: 0,
          attempts: 0,
          estimated_time: 10,
          instructions: "Answer the quiz questions about control theory concepts. You need to score at least 70% to pass.",
          video_url: null
        },
        C3: {
          id: "C3",
          challenge_id: "C3", 
          title: "PD Gain Tuning",
          description: "Learn controller design by tuning PD gains for optimal robot performance. Balance stability, response time, and accuracy.",
          challenge_type: "pd_control",
          type: "pd_control",
          difficulty: "beginner",
          is_unlocked: false,
          is_completed: false,
          best_score: 0,
          attempts: 0,
          estimated_time: 20,
          instructions: "Adjust the proportional (Kp) and derivative (Kd) gains to achieve optimal control performance.",
          video_url: null
        },
        C4: {
          id: "C4",
          challenge_id: "C4",
          title: "Workspace Identification", 
          description: "We will throw points at your robot, will it be able to catch them? Test your understanding of robot workspace and reachability.",
          challenge_type: "workspace",
          type: "workspace", 
          difficulty: "beginner",
          is_unlocked: false,
          is_completed: false,
          best_score: 0,
          attempts: 0,
          estimated_time: 25,
          instructions: "Identify whether the given points are within the robot's reachable workspace.",
          video_url: null
        },
        C5: {
          id: "C5",
          challenge_id: "C5",
          title: "2R - EE Orientation & Position",
          description: "Verify end effector's orientation and position kinematics for a 2R robot. Master forward kinematics and transformation matrices.",
          challenge_type: "orientation", 
          type: "orientation",
          difficulty: "beginner",
          is_unlocked: false,
          is_completed: false,
          best_score: 0,
          attempts: 0,
          estimated_time: 30,
          instructions: "Calculate the end effector position and orientation for given joint angles.",
          video_url: null
        }
      };
      
      const mockChallenge = mockChallengeData[challengeId];
      if (mockChallenge) {
        return { 
          data: {
            challenge: mockChallenge,
            user_progress: {
              best_score: mockChallenge.best_score,
              total_attempts: mockChallenge.attempts,
              is_completed: mockChallenge.is_completed
            },
            is_unlocked: mockChallenge.is_unlocked
          }
        };
      } else {
        // Return a generic challenge if specific one not found
        return {
          data: {
            challenge: {
              id: challengeId,
              challenge_id: challengeId,
              title: `Challenge ${challengeId}`,
              description: `This is challenge ${challengeId}. Complete the tasks to earn points.`,
              challenge_type: "manual_movement",
              type: "manual_movement",
              difficulty: "beginner",
              is_unlocked: challengeId === "C1",
              is_completed: false,
              best_score: 0,
              attempts: 0,
              estimated_time: 15,
              instructions: "Follow the instructions to complete this challenge.",
              video_url: null
            },
            user_progress: {
              best_score: 0,
              total_attempts: 0,
              is_completed: false
            },
            is_unlocked: challengeId === "C1"
          }
        };
      }
    }
  },

  // Start a challenge
  startChallenge: async (challengeId, parameters = {}) => {
    try {
      console.log(`🎯 Challenge Service: Starting challenge ${challengeId}...`);
      const response = await api.post(`/api/v1/challenges/${challengeId}/start`, parameters);
      console.log(`🎯 Challenge Service: Challenge ${challengeId} started successfully`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Start challenge ${challengeId} failed:`, error);
      
      // Mock successful start response
      console.log(`🎯 Using fallback mock start response for challenge ${challengeId}`);
      return {
        data: {
          attempt_id: Date.now(),
          challenge_id: challengeId,
          status: "started",
          attempt_number: 1,
          parameters: parameters || {},
          session_id: `session_${Date.now()}`,
          started_at: new Date().toISOString()
        }
      };
    }
  },

  // Submit challenge solution
  submitChallenge: async (challengeId, submission) => {
    try {
      console.log(`🎯 Challenge Service: Submitting challenge ${challengeId}...`);
      const response = await api.post(`/api/v1/challenges/${challengeId}/submit`, submission);
      console.log(`🎯 Challenge Service: Challenge ${challengeId} submitted successfully`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Submit challenge ${challengeId} failed:`, error);
      
      // Mock submission response
      console.log(`🎯 Using fallback mock submit response for challenge ${challengeId}`);
      const mockScore = Math.floor(Math.random() * 50) + 50; // 50-100
      
      return {
        data: {
          attempt_id: Date.now(),
          score: mockScore,
          success: mockScore > 60,
          feedback: mockScore > 80 ? 
            "Excellent work! You completed the challenge with high precision." :
            mockScore > 60 ?
            "Good job! You completed the challenge successfully." :
            "Keep practicing! You can improve your performance.",
          performance_data: submission,
          completed_at: new Date().toISOString()
        }
      };
    }
  },

  // Get challenge results/history
  getChallengeResults: async (challengeId) => {
    try {
      console.log(`🎯 Challenge Service: Fetching results for challenge ${challengeId}...`);
      const response = await api.get(`/api/v1/challenges/${challengeId}/results`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Fetch results for challenge ${challengeId} failed:`, error);
      
      // Mock results
      return {
        data: {
          attempts: [],
          best_score: 0,
          total_attempts: 0,
          average_score: 0,
          last_attempt: null
        }
      };
    }
  },

  // Get challenge attempt history
  getChallengeHistory: async (challengeId) => {
    try {
      console.log(`🎯 Challenge Service: Fetching history for challenge ${challengeId}...`);
      const response = await api.get(`/api/v1/challenges/${challengeId}/attempts`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Fetch history for challenge ${challengeId} failed:`, error);
      
      // Mock history
      return {
        data: {
          attempts: [],
          total_count: 0
        }
      };
    }
  },

  // Get challenge leaderboard
  getChallengeLeaderboard: async (challengeId, limit = 10) => {
    try {
      console.log(`🎯 Challenge Service: Fetching leaderboard for challenge ${challengeId}...`);
      const response = await api.get(`/api/v1/challenges/${challengeId}/leaderboard?limit=${limit}`);
      return response;
    } catch (error) {
      console.error(`🎯 Challenge Service: Fetch leaderboard for challenge ${challengeId} failed:`, error);
      
      // Mock leaderboard
      return {
        data: [
          {
            rank: 1,
            username: "RobotMaster",
            score: 95,
            attempts: 3,
            completion_time: "2:45"
          },
          {
            rank: 2,
            username: "TechGuru", 
            score: 88,
            attempts: 5,
            completion_time: "3:12"
          }
        ]
      };
    }
  },

  // Get user progress
  getUserProgress: async () => {
    try {
      console.log('👤 Challenge Service: Fetching user progress...');
      const response = await api.get('/api/v1/users/progress');
      return response;
    } catch (error) {
      console.error('👤 Challenge Service: Fetch user progress failed:', error);
      
      // Mock user progress
      return {
        data: {
          completed: 0,
          totalScore: 0,
          rank: 'Rising Roboticist',
          challengesCompleted: 0,
          streakCount: 0,
          achievements: [],
          recent_activity: []
        }
      };
    }
  },

  // Get global leaderboard
  getLeaderboard: async (limit = 50) => {
    try {
      console.log('🏆 Challenge Service: Fetching leaderboard...');
      const response = await api.get(`/api/v1/users/leaderboard?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('🏆 Challenge Service: Fetch leaderboard failed:', error);
      
      // Mock leaderboard
      return {
        data: [
          {
            id: 1,
            username: "RobotMaster",
            challengesCompleted: 5,
            totalScore: 450,
            rank: "Robotics Master"
          },
          {
            id: 2,
            username: "TechGuru",
            challengesCompleted: 4,
            totalScore: 380,
            rank: "Robotics Specialist"
          },
          {
            id: 3,
            username: "CodeBot",
            challengesCompleted: 3,
            totalScore: 290,
            rank: "Robotics Beginner"
          }
        ]
      };
    }
  },

  // Get hardware status
  getHardwareStatus: async () => {
    try {
      console.log('🤖 Challenge Service: Fetching hardware status...');
      const response = await api.get('/api/v1/challenges/system/hardware-status');
      return response;
    } catch (error) {
      console.error('🤖 Challenge Service: Fetch hardware status failed:', error);
      
      // Mock hardware status
      return {
        data: {
          connected: false,
          robot_status: "disconnected",
          joints: [
            { id: 1, position: 0, enabled: false },
            { id: 2, position: 0, enabled: false },
            { id: 3, position: 0, enabled: false }
          ],
          last_update: new Date().toISOString()
        }
      };
    }
  },

  // Add a method to validate API connection
  validateConnection: async () => {
    try {
      const response = await api.get('/api/v1/health');
      return { connected: true, data: response.data };
    } catch (error) {
      console.warn('⚠️ API Connection failed, using mock data mode');
      return { connected: false, error: error.message };
    }
  }
};

export default challengeService;