// src/components/challenges/ChallengeCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ChallengeCard = ({ challenge, onStart, onShowDetails }) => {
  const {
    id,
    number,
    title,
    description,
    difficulty,
    icon,
    features,
    unlocked,
    completed,
    score,
    prerequisite
  } = challenge;

  const getStatusInfo = () => {
    if (completed) {
      return {
        icon: 'fas fa-trophy',
        text: `Completed - Score: ${score}%`,
        className: 'status-completed'
      };
    }
    if (unlocked) {
      return {
        icon: 'fas fa-unlock',
        text: 'Available',
        className: 'status-available'
      };
    }
    return {
      icon: 'fas fa-lock',
      text: prerequisite || 'Locked',
      className: 'status-locked'
    };
  };

  const statusInfo = getStatusInfo();

  const cardVariants = {
    hover: {
      scale: 1.02,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const glowVariants = {
    hover: {
      boxShadow: unlocked 
        ? "0 20px 40px rgba(12, 192, 223, 0.3)"
        : "0 10px 20px rgba(108, 117, 125, 0.2)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className={`challenge-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
      variants={cardVariants}
      whileHover="hover"
      layout
    >
      <motion.div 
        className="card-content"
        variants={glowVariants}
        whileHover="hover"
      >
        {/* Animated Background Effect */}
        <div className="card-background-effect"></div>
        
        {/* Challenge Header */}
        <div className="challenge-header">
          <div className="challenge-number">
            <span>{number}</span>
          </div>
          <div className={`difficulty-badge difficulty-${difficulty}`}>
            {difficulty}
          </div>
        </div>

        {/* Challenge Icon & Title */}
        <div className="challenge-main">
          <div className="challenge-icon">
            <i className={icon}></i>
          </div>
          <h3 className="challenge-title">{title}</h3>
        </div>

        {/* Description */}
        <p className="challenge-description">{description}</p>

        {/* Features List */}
        <div className="challenge-features">
          <h4 className="features-title">Challenge Features:</h4>
          <ul className="features-list">
            {features.map((feature, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <i className="fas fa-bolt"></i>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Progress Bar for Completed Challenges */}
        {completed && (
          <div className="challenge-progress">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="progress-text">{score}% Score</span>
          </div>
        )}

        {/* Actions & Status */}
        <div className="challenge-actions">
          <div className="action-buttons">
            <motion.button
              className={`btn ${unlocked ? 'btn-primary' : 'btn-disabled'}`}
              onClick={unlocked ? onStart : undefined}
              disabled={!unlocked}
              whileHover={unlocked ? { scale: 1.05 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
            >
              <i className={unlocked ? 'fas fa-play' : 'fas fa-lock'}></i>
              {completed ? 'Retry' : unlocked ? 'Start Challenge' : 'Locked'}
            </motion.button>
            
            <motion.button
              className="btn btn-secondary"
              onClick={onShowDetails}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-info"></i>
              Details
            </motion.button>
          </div>

          <div className={`status-indicator ${statusInfo.className}`}>
            <i className={statusInfo.icon}></i>
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Completion Badge */}
        {completed && (
          <motion.div 
            className="completion-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3
            }}
          >
            <i className="fas fa-medal"></i>
          </motion.div>
        )}

        {/* Unlock Animation Overlay */}
        {unlocked && !completed && (
          <motion.div 
            className="unlock-shine"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChallengeCard;