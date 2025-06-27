// // src/store/challengeSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import challengeService from '../services/challengeService';

// // Async thunks
// export const fetchChallenges = createAsyncThunk(
//   'challenges/fetchChallenges',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.getChallenges();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenges');
//     }
//   }
// );

// export const fetchChallenge = createAsyncThunk(
//   'challenges/fetchChallenge',
//   async (challengeId, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.getChallenge(challengeId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge');
//     }
//   }
// );

// export const startChallenge = createAsyncThunk(
//   'challenges/startChallenge',
//   async ({ challengeId, parameters }, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.startChallenge(challengeId, parameters);
//       return { challengeId, data: response.data };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to start challenge');
//     }
//   }
// );

// export const submitChallenge = createAsyncThunk(
//   'challenges/submitChallenge',
//   async ({ challengeId, submission }, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.submitChallenge(challengeId, submission);
//       return { challengeId, data: response.data };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to submit challenge');
//     }
//   }
// );

// export const completeChallenge = createAsyncThunk(
//   'challenges/completeChallenge',
//   async ({ challengeId, results }, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.completeChallenge(challengeId, results);
//       return { challengeId, data: response.data };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to complete challenge');
//     }
//   }
// );

// export const fetchUserProgress = createAsyncThunk(
//   'challenges/fetchUserProgress',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.getUserProgress();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch user progress');
//     }
//   }
// );

// export const fetchLeaderboard = createAsyncThunk(
//   'challenges/fetchLeaderboard',
//   async (challengeId, { rejectWithValue }) => {
//     try {
//       const response = await challengeService.getLeaderboard(challengeId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
//     }
//   }
// );

// const initialState = {
//   challenges: [],
//   currentChallenge: null,
//   challengeDetails: {},
//   challengeResults: {},
//   userProgress: {
//     completed: 0,
//     totalScore: 0,
//     rank: 'Rising Roboticist',
//     challengesCompleted: 0,
//     streakCount: 0
//   },
//   leaderboards: {},
//   loading: false,
//   error: null,
//   // Challenge-specific states
//   challenge1: {
//     score: 0,
//     timeElapsed: 0,
//     accuracy: 0,
//     attempts: 0
//   },
//   session: {
//     sessionId: null,
//     startTime: null
//   }
// };

// const challengeSlice = createSlice({
//   name: 'challenges',
//   initialState,
//   reducers: {
//     setCurrentChallenge: (state, action) => {
//       state.currentChallenge = action.payload;
//     },
//     clearCurrentChallenge: (state) => {
//       state.currentChallenge = null;
//     },
//     updateChallengeProgress: (state, action) => {
//       const { challengeId, progress } = action.payload;
//       const challenge = state.challenges.find(c => c.id === challengeId);
//       if (challenge) {
//         challenge.progress = progress;
//       }
      
//       // Update challenge1 specific state if it's challenge 1
//       if (challengeId === 1 || challengeId === '1') {
//         state.challenge1 = {
//           ...state.challenge1,
//           ...progress
//         };
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     resetChallengeState: (state) => {
//       state.currentChallenge = null;
//       state.error = null;
//       state.loading = false;
//     },
//     updateSession: (state, action) => {
//       state.session = {
//         ...state.session,
//         ...action.payload
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch challenges
//       .addCase(fetchChallenges.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchChallenges.fulfilled, (state, action) => {
//         state.loading = false;
//         state.challenges = action.payload.challenges || action.payload;
//         if (action.payload.userProgress) {
//           state.userProgress = action.payload.userProgress;
//         }
//       })
//       .addCase(fetchChallenges.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch individual challenge
//       .addCase(fetchChallenge.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchChallenge.fulfilled, (state, action) => {
//         state.loading = false;
//         const challenge = action.payload;
//         state.challengeDetails[challenge.id] = challenge;
//       })
//       .addCase(fetchChallenge.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Start challenge
//       .addCase(startChallenge.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(startChallenge.fulfilled, (state, action) => {
//         state.loading = false;
//         const { challengeId, data } = action.payload;
//         state.currentChallenge = { id: challengeId, ...data };
        
//         // Initialize session
//         state.session = {
//           sessionId: data.sessionId || Date.now().toString(),
//           startTime: new Date().toISOString()
//         };
//       })
//       .addCase(startChallenge.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Submit challenge
//       .addCase(submitChallenge.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(submitChallenge.fulfilled, (state, action) => {
//         state.loading = false;
//         const { challengeId, data } = action.payload;
//         state.challengeResults[challengeId] = data;
        
//         // Update challenge completion status
//         const challenge = state.challenges.find(c => c.id === challengeId);
//         if (challenge && data.score !== undefined) {
//           challenge.completed = true;
//           challenge.score = data.score;
//           state.userProgress.completed += 1;
//           state.userProgress.totalScore += data.score;
//           state.userProgress.challengesCompleted += 1;
//         }
//       })
//       .addCase(submitChallenge.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Complete challenge
//       .addCase(completeChallenge.fulfilled, (state, action) => {
//         const { challengeId, data } = action.payload;
//         state.challengeResults[challengeId] = data;
//         state.currentChallenge = null;
//       })
      
//       // Fetch user progress
//       .addCase(fetchUserProgress.fulfilled, (state, action) => {
//         state.userProgress = action.payload;
//       })
      
//       // Fetch leaderboard
//       .addCase(fetchLeaderboard.fulfilled, (state, action) => {
//         const leaderboard = action.payload;
//         if (leaderboard.challengeId) {
//           state.leaderboards[leaderboard.challengeId] = leaderboard.data || leaderboard;
//         }
//       });
//   },
// });

// export const { 
//   setCurrentChallenge, 
//   clearCurrentChallenge, 
//   updateChallengeProgress, 
//   clearError,
//   resetChallengeState,
//   updateSession
// } = challengeSlice.actions;

// export default challengeSlice.reducer;
// src/store/challengeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import challengeService from '../services/challengeService';
import { getMockChallengesWithProgress } from '../utils/mockChallengeData';

// Async thunks
export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching challenges...');
      
      // Try real API first
      try {
        const response = await challengeService.getChallenges();
        console.log('✅ Real API response:', response.data);
        return response.data;
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock data:', apiError.message);
        
        // Fallback to mock data
        const mockData = getMockChallengesWithProgress();
        console.log('📦 Using mock data:', mockData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockData;
      }
    } catch (error) {
      console.error('❌ Both real API and mock data failed:', error);
      return rejectWithValue(error.message || 'Failed to fetch challenges');
    }
  }
);

export const fetchChallenge = createAsyncThunk(
  'challenges/fetchChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching challenge:', challengeId);
      
      // Try real API first
      try {
        const response = await challengeService.getChallenge(challengeId);
        return response.data;
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock data for challenge:', challengeId);
        
        // Fallback to mock data
        const mockData = getMockChallengesWithProgress();
        const challenge = mockData.challenges.find(c => c.id == challengeId);
        
        if (challenge) {
          return {
            challenge: challenge,
            user_progress: {
              best_score: challenge.best_score,
              total_attempts: challenge.attempts,
              is_completed: challenge.is_completed
            },
            is_unlocked: challenge.is_unlocked
          };
        } else {
          throw new Error(`Challenge ${challengeId} not found`);
        }
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch challenge');
    }
  }
);

export const startChallenge = createAsyncThunk(
  'challenges/startChallenge',
  async ({ challengeId, parameters }, { rejectWithValue }) => {
    try {
      console.log('🚀 Starting challenge:', challengeId, parameters);
      
      // Try real API first
      try {
        const response = await challengeService.startChallenge(challengeId, parameters);
        return { challengeId, data: response.data };
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock response for start challenge');
        
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
          challengeId,
          data: {
            attempt_id: Date.now(),
            challenge_id: challengeId,
            status: "started",
            attempt_number: 1,
            parameters: parameters || {}
          }
        };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start challenge');
    }
  }
);

export const submitChallenge = createAsyncThunk(
  'challenges/submitChallenge',
  async ({ challengeId, submission }, { rejectWithValue }) => {
    try {
      console.log('📤 Submitting challenge:', challengeId, submission);
      
      // Try real API first
      try {
        const response = await challengeService.submitChallenge(challengeId, submission);
        return { challengeId, data: response.data };
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock response for submit challenge');
        
        // Mock response with random score
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockScore = Math.floor(Math.random() * 50) + 50; // 50-100
        
        return {
          challengeId,
          data: {
            attempt_id: Date.now(),
            score: mockScore,
            success: mockScore > 60,
            feedback: mockScore > 80 ? 
              "Excellent work! You completed the challenge with high precision." :
              mockScore > 60 ?
              "Good job! You completed the challenge successfully." :
              "Keep practicing! You can improve your performance.",
            performance_data: submission
          }
        };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit challenge');
    }
  }
);

export const completeChallenge = createAsyncThunk(
  'challenges/completeChallenge',
  async ({ challengeId, results }, { rejectWithValue }) => {
    try {
      // Mock completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        challengeId,
        data: {
          completed: true,
          final_score: results.score || 0,
          completion_time: Date.now()
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete challenge');
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'challenges/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      // Try real API first
      try {
        const response = await challengeService.getUserProgress();
        return response.data;
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock user progress');
        
        // Mock user progress
        const mockData = getMockChallengesWithProgress();
        return mockData.userProgress;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user progress');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'challenges/fetchLeaderboard',
  async (challengeId, { rejectWithValue }) => {
    try {
      // Try real API first
      try {
        const response = await challengeService.getLeaderboard(challengeId);
        return response.data;
      } catch (apiError) {
        console.warn('⚠️ Real API failed, using mock leaderboard');
        
        // Mock leaderboard
        return [
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
        ];
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  challenges: [],
  currentChallenge: null,
  challengeDetails: {},
  challengeResults: {},
  userProgress: {
    completed: 0,
    totalScore: 0,
    rank: 'Rising Roboticist',
    challengesCompleted: 0,
    streakCount: 0
  },
  leaderboards: {},
  loading: false,
  error: null,
  // Challenge-specific states
  challenge1: {
    score: 0,
    timeElapsed: 0,
    accuracy: 0,
    attempts: 0
  },
  session: {
    sessionId: null,
    startTime: null
  },
  // Track if we're using mock data
  usingMockData: false
};

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setCurrentChallenge: (state, action) => {
      state.currentChallenge = action.payload;
    },
    clearCurrentChallenge: (state) => {
      state.currentChallenge = null;
    },
    updateChallengeProgress: (state, action) => {
      const { challengeId, progress } = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.progress = progress;
      }
      
      // Update challenge1 specific state if it's challenge 1
      if (challengeId === 1 || challengeId === '1') {
        state.challenge1 = {
          ...state.challenge1,
          ...progress
        };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChallengeState: (state) => {
      state.currentChallenge = null;
      state.error = null;
      state.loading = false;
    },
    updateSession: (state, action) => {
      state.session = {
        ...state.session,
        ...action.payload
      };
    },
    // Add action to manually set mock data (for testing)
    setMockChallenges: (state) => {
      const mockData = getMockChallengesWithProgress();
      state.challenges = mockData.challenges;
      state.userProgress = mockData.userProgress;
      state.usingMockData = true;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch challenges
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload.challenges || action.payload;
        if (action.payload.userProgress) {
          state.userProgress = action.payload.userProgress;
        }
        // Check if this was mock data
        state.usingMockData = Array.isArray(action.payload.challenges);
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch individual challenge
      .addCase(fetchChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenge.fulfilled, (state, action) => {
        state.loading = false;
        const challenge = action.payload;
        state.challengeDetails[challenge.challenge?.id || challenge.id] = challenge;
      })
      .addCase(fetchChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start challenge
      .addCase(startChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startChallenge.fulfilled, (state, action) => {
        state.loading = false;
        const { challengeId, data } = action.payload;
        state.currentChallenge = { id: challengeId, ...data };
        
        // Initialize session
        state.session = {
          sessionId: data.sessionId || Date.now().toString(),
          startTime: new Date().toISOString()
        };
      })
      .addCase(startChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit challenge
      .addCase(submitChallenge.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitChallenge.fulfilled, (state, action) => {
        state.loading = false;
        const { challengeId, data } = action.payload;
        state.challengeResults[challengeId] = data;
        
        // Update challenge completion status
        const challenge = state.challenges.find(c => c.id == challengeId);
        if (challenge && data.score !== undefined) {
          challenge.is_completed = data.success;
          challenge.best_score = Math.max(challenge.best_score || 0, data.score);
          challenge.attempts = (challenge.attempts || 0) + 1;
          
          // Update user progress
          if (data.success && !challenge.is_completed) {
            state.userProgress.challengesCompleted += 1;
          }
          state.userProgress.totalScore += data.score;
        }
      })
      .addCase(submitChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Complete challenge
      .addCase(completeChallenge.fulfilled, (state, action) => {
        const { challengeId, data } = action.payload;
        state.challengeResults[challengeId] = data;
        state.currentChallenge = null;
      })
      
      // Fetch user progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.userProgress = action.payload;
      })
      
      // Fetch leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        const leaderboard = action.payload;
        if (Array.isArray(leaderboard)) {
          state.leaderboards.global = leaderboard;
        } else if (leaderboard.challengeId) {
          state.leaderboards[leaderboard.challengeId] = leaderboard.data || leaderboard;
        }
      });
  },
});

export const { 
  setCurrentChallenge, 
  clearCurrentChallenge, 
  updateChallengeProgress, 
  clearError,
  resetChallengeState,
  updateSession,
  setMockChallenges
} = challengeSlice.actions;

export default challengeSlice.reducer;