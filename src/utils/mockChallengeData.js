// src/utils/mockChallengeData.js
export const mockChallenges = [
  {
    id: 1,
    title: "Basic Joint Movement",
    description: "Learn to control individual robot joints and understand forward kinematics. Move each joint separately to see how they affect the robot's position.",
    difficulty: "beginner",
    type: "manual_movement",
    estimated_time: 30,
    max_score: 100,
    points: 20,
    is_unlocked: true,
    is_completed: false,
    best_score: 0,
    attempts: 0,
    instructions: "Use the joint controls to move each joint of the robot. Observe how each joint affects the end-effector position. Complete the target positions to finish this challenge.",
    video_url: null
  },
  {
    id: 2,
    title: "Position Control Challenge",
    description: "Move the robot end-effector to specific target positions in 3D space using inverse kinematics.",
    difficulty: "intermediate",
    type: "position_control",
    estimated_time: 45,
    max_score: 150,
    points: 35,
    is_unlocked: true,
    is_completed: false,
    best_score: 0,
    attempts: 0,
    instructions: "Guide the robot's end-effector to reach the specified target positions. Use your understanding of inverse kinematics to calculate the required joint angles.",
    video_url: null
  },
  {
    id: 3,
    title: "Trajectory Planning",
    description: "Plan and execute smooth trajectories between multiple waypoints while avoiding obstacles.",
    difficulty: "advanced",
    type: "trajectory_planning",
    estimated_time: 60,
    max_score: 200,
    points: 50,
    is_unlocked: false,
    is_completed: false,
    best_score: 0,
    attempts: 0,
    instructions: "Create smooth trajectories that connect multiple waypoints while avoiding obstacles in the workspace. Consider velocity and acceleration constraints.",
    video_url: null
  },
  {
    id: 4,
    title: "PD Control Implementation",
    description: "Implement a PD controller for precise position control with stability analysis.",
    difficulty: "advanced",
    type: "control_theory",
    estimated_time: 75,
    max_score: 200,
    points: 60,
    is_unlocked: false,
    is_completed: false,
    best_score: 0,
    attempts: 0,
    instructions: "Design and tune a PD controller for the robot joints. Analyze stability and performance characteristics.",
    video_url: null
  },
  {
    id: 5,
    title: "Force Control",
    description: "Implement force control for safe interaction with the environment.",
    difficulty: "expert",
    type: "force_control",
    estimated_time: 90,
    max_score: 250,
    points: 75,
    is_unlocked: false,
    is_completed: false,
    best_score: 0,
    attempts: 0,
    instructions: "Implement force feedback control to enable safe physical interaction between the robot and its environment.",
    video_url: null
  }
];

export const mockUserProgress = {
  challengesCompleted: 0,
  totalScore: 0,
  rank: "Rising Roboticist",
  streakCount: 0,
  averageScore: 0,
  totalAttempts: 0,
  timeSpent: 0
};

// Function to get mock challenges with user progress
export const getMockChallengesWithProgress = () => {
  return {
    challenges: mockChallenges,
    userProgress: mockUserProgress
  };
};