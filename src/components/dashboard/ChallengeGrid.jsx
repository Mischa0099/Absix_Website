// src/components/dashboard/ChallengeGrid.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ChallengeCard from '../challenges/ChallengeCard';
import Modal from '../common/Modal';
import { challengeDetailsData } from '..\src\utils\ChallengeData.js';

const ChallengeGrid = ({ challenges = [], progress = {} }) => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Define the first 5 challenges with their details
  const challengeConfigs = [
    {
      id: 'C1',
      number: '01',
      title: 'Combined Angle Challenge',
      description: 'Master robot joint control by manually positioning the robot to match target angles. Test your understanding of robot configuration and physical manipulation.',
      difficulty: 'beginner',
      type: 'manual_movement',
      icon: 'fas fa-crosshairs',
      features: [
        '3 progressive tasks (absolute, relative, random)',
        'Real-time robot manipulation',
        'Precision scoring system',
        'Joint angle accuracy measurement'
      ],
      unlocked: true,
      completed: progress?.C1?.completed || false,
      score: progress?.C1?.score || 0
    },
    {
      id: 'C2',
      number: '02',
      title: 'Controls Quiz',
      description: 'Test your theoretical knowledge of control systems with this interactive quiz. Master the fundamentals before diving into practical applications.',
      difficulty: 'beginner',
      type: 'quiz',
      icon: 'fas fa-brain',
      features: [
        'Interactive quiz system',
        'Control theory concepts',
        'Instant feedback mechanism',
        'Knowledge assessment scoring'
      ],
      unlocked: progress?.C1?.completed || false,
      completed: progress?.C2?.completed || false,
      score: progress?.C2?.score || 0,
      prerequisite: 'Complete Challenge 1'
    },
    {
      id: 'C3',
      number: '03',
      title: 'PD Gain Tuning',
      description: 'Learn controller design by tuning PD gains for optimal robot performance. Balance stability, response time, and accuracy.',
      difficulty: 'beginner',
      type: 'pd_control',
      icon: 'fas fa-sliders-h',
      features: [
        'Real-time parameter tuning',
        'Performance visualization',
        'Settling time analysis',
        'Overshoot and stability metrics'
      ],
      unlocked: progress?.C2?.completed || false,
      completed: progress?.C3?.completed || false,
      score: progress?.C3?.score || 0,
      prerequisite: 'Complete Challenge 2'
    },
    {
      id: 'C4',
      number: '04',
      title: 'Workspace Identification',
      description: '"We will throw points at your robot, will it be able to catch them?" Test your understanding of robot workspace and reachability.',
      difficulty: 'beginner',
      type: 'workspace',
      icon: 'fas fa-crosshairs',
      features: [
        '6 random point tests',
        'Reachability analysis',
        'Visual workspace display',
        '80% accuracy requirement'
      ],
      unlocked: progress?.C3?.completed || false,
      completed: progress?.C4?.completed || false,
      score: progress?.C4?.score || 0,
      prerequisite: 'Complete Challenge 3'
    },
    {
      id: 'C5',
      number: '05',
      title: '2R - EE Orientation & Position',
      description: 'Verify end effector\'s orientation and position kinematics for a 2R robot. Master forward kinematics and transformation matrices.',
      difficulty: 'beginner',
      type: 'orientation',
      icon: 'fas fa-compass',
      features: [
        'Kinematics verification',
        'Matrix calculations',
        'Joint limit constraints',
        'Position & orientation tolerance'
      ],
      unlocked: progress?.C4?.completed || false,
      completed: progress?.C5?.completed || false,
      score: progress?.C5?.score || 0,
      prerequisite: 'Complete Challenge 4'
    }
  ];

  const handleStartChallenge = (challengeId) => {
    const challenge = challengeConfigs.find(c => c.id === challengeId);
    if (challenge?.unlocked) {
      navigate(`/challenges/${challengeId}`);
    }
  };

  const handleShowDetails = (challengeId) => {
    setSelectedChallenge(challengeId);
    setShowDetailsModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.div 
        className="challenges-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {challengeConfigs.map((challenge) => (
          <motion.div
            key={challenge.id}
            variants={cardVariants}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.2 }
            }}
          >
            <ChallengeCard
              challenge={challenge}
              onStart={() => handleStartChallenge(challenge.id)}
              onShowDetails={() => handleShowDetails(challenge.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Challenge Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedChallenge && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="Challenge Details"
            size="large"
          >
            <ChallengeDetailsContent 
              challengeId={selectedChallenge}
              challengeData={challengeConfigs.find(c => c.id === selectedChallenge)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

// Challenge Details Modal Content
const ChallengeDetailsContent = ({ challengeId, challengeData }) => {
  const details = challengeDetailsData[challengeId];
  
  if (!details || !challengeData) return null;

  return (
    <div className="challenge-details-content">
      <div className="details-header">
        <div className="challenge-badge">
          <i className={challengeData.icon}></i>
          <span>Challenge {challengeData.number}</span>
        </div>
        <div className={`difficulty-badge difficulty-${challengeData.difficulty}`}>
          {challengeData.difficulty}
        </div>
      </div>

      <h2 className="details-title">{challengeData.title}</h2>
      
      <div className="details-grid">
        <div className="detail-item">
          <h4>Type</h4>
          <p>{details.type}</p>
        </div>
        <div className="detail-item">
          <h4>Difficulty</h4>
          <p>{details.difficulty}</p>
        </div>
        <div className="detail-item">
          <h4>Time Limit</h4>
          <p>{details.timeLimit}</p>
        </div>
        <div className="detail-item">
          <h4>Equipment</h4>
          <p>{details.equipment}</p>
        </div>
      </div>

      <div className="details-section">
        <h4>Description</h4>
        <p>{details.description}</p>
      </div>

      <div className="details-section">
        <h4>Learning Objectives</h4>
        <ul className="objectives-list">
          {details.objectives.map((objective, index) => (
            <li key={index}>
              <i className="fas fa-check-circle"></i>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h4>Success Criteria</h4>
        <ul className="criteria-list">
          {details.successCriteria.map((criteria, index) => (
            <li key={index}>
              <i className="fas fa-target"></i>
              {criteria}
            </li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h4>Scoring Method</h4>
        <p>{details.scoring}</p>
      </div>
    </div>
  );
};

export default ChallengeGrid;