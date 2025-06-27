// src/utils/challengeData.js

export const challengeDetailsData = {
  // Updated C1 data to match the new Challenge1 component
  C1: {
    id: 'C1',
    title: 'Robot Configuration',
    description: 'Learn manual robot positioning and develop intuition about joint angles',
    type: 'Manual Movement',
    difficulty: 'Beginner',
    estimatedTime: '15-20 minutes',
    objectives: [
      'Position robot to absolute joint angles',
      'Position robot to relative joint angles', 
      'Develop intuition about robot configurations',
      'Practice manual robot control'
    ],
    successCriteria: [
      'Complete 3 positioning tasks',
      'Achieve ±10° accuracy tolerance',
      'Score minimum 60% overall'
    ],
    equipment: 'Robot Arm + Manual Control Interface',
    timeLimit: '20 minutes',
    scoring: 'Precision-based scoring with tolerance bands',
    prerequisites: [
      'Basic understanding of robot joints',
      'Familiarity with angle measurements'
    ],
    learningOutcomes: [
      'Manual robot positioning skills',
      'Understanding of absolute vs relative angles',
      'Robot configuration intuition',
      'Precision movement control'
    ],
    maxScore: 100,
    passingScore: 60,
    icon: 'Settings',
    category: 'fundamentals',
    tags: ['manual-control', 'positioning', 'basics'],
    hardwareRequired: true,
    robotConnectionRequired: true
  },
  
  // Keep the existing challenge1 data for backward compatibility
  challenge1: {
    id: 'challenge1',
    title: 'Robot Configuration',
    description: 'Learn manual robot positioning and develop intuition about joint angles',
    type: 'manual',
    difficulty: 'Beginner',
    estimatedTime: '15-20 minutes',
    objectives: [
      'Position robot to absolute joint angles',
      'Position robot to relative joint angles', 
      'Develop intuition about robot configurations',
      'Practice manual robot control'
    ],
    prerequisites: [
      'Basic understanding of robot joints',
      'Familiarity with angle measurements'
    ],
    learningOutcomes: [
      'Manual robot positioning skills',
      'Understanding of absolute vs relative angles',
      'Robot configuration intuition',
      'Precision movement control'
    ],
    maxScore: 100,
    passingScore: 60,
    icon: 'Settings',
    category: 'fundamentals',
    tags: ['manual-control', 'positioning', 'basics'],
    hardwareRequired: true,
    robotConnectionRequired: true
  },
  
  C2: {
    title: "Controls Quiz",
    type: "Interactive Quiz",
    difficulty: "Beginner", 
    description: "Test your theoretical understanding of control systems, feedback loops, and robotics fundamentals.",
    objectives: [
      "Demonstrate control theory knowledge",
      "Understand feedback mechanisms",
      "Master stability concepts",
      "Apply control principles"
    ],
    successCriteria: [
      "Score minimum 80% on quiz",
      "Answer all sections correctly",
      "Complete within time limit"
    ],
    equipment: "Interactive Quiz Interface",
    timeLimit: "20 minutes",
    scoring: "Points per correct answer with time bonus",
    technicalDetails: {
      questionTypes: [
        "Multiple choice",
        "True/False",
        "Diagram interpretation",
        "Calculation problems"
      ],
      topics: [
        "Open vs Closed loop control",
        "PID control principles",
        "System stability",
        "Transfer functions",
        "Feedback mechanisms"
      ],
      passingScore: 80
    }
  },
  
  C3: {
    title: "PD Gain Tuning",
    type: "Parameter Optimization",
    difficulty: "Beginner",
    description: "Learn controller design by tuning Proportional and Derivative gains for optimal robot performance.",
    objectives: [
      "Tune KP and KD parameters effectively",
      "Achieve target settling time < 3.0s",
      "Minimize overshoot < 20%",
      "Reduce steady-state error < 0.02"
    ],
    successCriteria: [
      "Meet all performance metrics",
      "Stable controller response",
      "No oscillations or instability"
    ],
    equipment: "PD Controller Interface + Robot",
    timeLimit: "25 minutes",
    scoring: "Performance metrics weighted scoring",
    technicalDetails: {
      parameterRanges: {
        kp: { min: 0, max: 16500, default: 10.0 },
        kd: { min: 0, max: 10.0, default: 1.0 }
      },
      performanceMetrics: {
        settlingTime: { target: 3.0, weight: 40 },
        overshoot: { target: 20.0, weight: 30 },
        steadyStateError: { target: 0.02, weight: 30 }
      },
      targetAngle: 1.5,
      samplingRate: 0.01
    }
  },
  
  C4: {
    title: "Workspace Identification", 
    type: "Reachability Analysis",
    difficulty: "Beginner",
    description: "Determine if randomly generated points are within the robot's reachable workspace.",
    objectives: [
      "Analyze 6 random test points",
      "Determine reachability accurately",
      "Understand workspace limitations",
      "Achieve 80% accuracy minimum"
    ],
    successCriteria: [
      "Minimum 5 out of 6 correct answers",
      "Demonstrate workspace understanding",
      "Complete within time limit"
    ],
    equipment: "Workspace Visualization Tool",
    timeLimit: "20 minutes", 
    scoring: "Binary scoring with accuracy bonus",
    technicalDetails: {
      robotConfiguration: {
        linkLengths: [0.10, 0.07, 0.05], // meters
        jointLimits: [
          { min: -Math.PI, max: Math.PI },
          { min: -Math.PI/2, max: Math.PI/2 },
          { min: -Math.PI/2, max: Math.PI/2 }
        ]
      },
      workspaceType: "2D planar",
      accuracyThreshold: 0.8,
      pointGenerationRange: {
        x: [-0.25, 0.25],
        y: [-0.25, 0.25]
      }
    }
  },
  
  C5: {
    title: "2R - EE Orientation & Position",
    type: "Kinematics Verification",
    difficulty: "Beginner",
    description: "Verify end effector kinematics calculations for a 2R robotic manipulator system.",
    objectives: [
      "Calculate forward kinematics correctly",
      "Verify orientation matrices",
      "Check position calculations", 
      "Apply joint limit constraints"
    ],
    successCriteria: [
      "Matrix tolerance within 0.1",
      "Position tolerance within 0.01m",
      "All calculations verified"
    ],
    equipment: "2R Robot Kinematics Interface", 
    timeLimit: "30 minutes",
    scoring: "Graded scoring per calculation step",
    technicalDetails: {
      robotType: "2R planar manipulator",
      linkLengths: [0.10, 0.07], // L1, L2 in meters
      jointLimits: {
        joint1: { min: -90, max: 90 }, // degrees
        joint2: { min: -90, max: 90 }
      },
      tolerances: {
        orientation: 0.1,
        position: 0.01
      },
      outputFormat: {
        angles: "degrees",
        positions: "meters",
        matrices: "3x3 rotation"
      },
      scoringBreakdown: {
        forwardKinematics: 40,
        orientationCalculation: 30,
        matrixVerification: 30
      }
    }
  }
};

// Helper functions for challenge data
export const getChallengeById = (id) => {
  return challengeDetailsData[id] || null;
};

export const getChallengeDifficulty = (id) => {
  const challenge = getChallengeById(id);
  return challenge ? challenge.difficulty : 'Unknown';
};

export const getChallengeType = (id) => {
  const challenge = getChallengeById(id);
  return challenge ? challenge.type : 'Unknown';
};

export const getChallengePrerequisites = (id) => {
  const prerequisites = {
    C1: [],
    C2: ['C1'],
    C3: ['C1', 'C2'],
    C4: ['C1', 'C2', 'C3'],
    C5: ['C1', 'C2', 'C3', 'C4']
  };
  return prerequisites[id] || [];
};

export const getUnlockRequirements = (id, userProgress = {}) => {
  const prerequisites = getChallengePrerequisites(id);
  
  if (prerequisites.length === 0) {
    return { unlocked: true, message: 'Available' };
  }
  
  const unmetPrereqs = prerequisites.filter(prereq => 
    !userProgress[prereq]?.completed
  );
  
  if (unmetPrereqs.length > 0) {
    const lastPrereq = unmetPrereqs[unmetPrereqs.length - 1];
    return { 
      unlocked: false, 
      message: `Complete Challenge ${lastPrereq.slice(1)}` 
    };
  }
  
  return { unlocked: true, message: 'Available' };
};

export const calculateProgressPercentage = (userProgress = {}) => {
  const totalChallenges = Object.keys(challengeDetailsData).filter(key => key.startsWith('C')).length;
  const completedChallenges = Object.values(userProgress).filter(
    progress => progress.completed
  ).length;
  
  return (completedChallenges / totalChallenges) * 100;
};

export const getNextChallenge = (userProgress = {}) => {
  const challengeIds = ['C1', 'C2', 'C3', 'C4', 'C5'];
  
  for (const id of challengeIds) {
    const requirements = getUnlockRequirements(id, userProgress);
    if (requirements.unlocked && !userProgress[id]?.completed) {
      return id;
    }
  }
  
  return null; // All challenges completed
};

export const getRankFromProgress = (userProgress = {}) => {
  const completed = Object.values(userProgress).filter(p => p.completed).length;
  const totalScore = Object.values(userProgress).reduce((sum, p) => sum + (p.score || 0), 0);
  
  if (completed >= 4 && totalScore >= 350) {
    return { rank: 'Robotics Master', color: '#ffd60a', icon: 'fas fa-crown' };
  } else if (completed >= 3 && totalScore >= 250) {
    return { rank: 'Robotics Expert', color: '#0cc0df', icon: 'fas fa-star' };
  } else if (completed >= 2 && totalScore >= 150) {
    return { rank: 'Robotics Apprentice', color: '#28a745', icon: 'fas fa-medal' };
  } else if (completed >= 1) {
    return { rank: 'Robotics Novice', color: '#ffc107', icon: 'fas fa-seedling' };
  } else {
    return { rank: 'Rising Roboticist', color: '#6c757d', icon: 'fas fa-user-graduate' };
  }
};