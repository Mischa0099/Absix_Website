// src/components/dashboard/ProgressTracker.jsx
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ProgressTracker = ({ progress = {}, challenges = [] }) => {
  const [animatedStats, setAnimatedStats] = useState({
    unlocked: 0,
    completed: 0,
    totalScore: 0,
    progressPercentage: 0
  });

  const controls = useAnimation();

  // Calculate actual stats
  const calculateStats = () => {
    const unlockedCount = challenges.filter(c => 
      c.unlocked || progress[c.id]?.unlocked
    ).length || 1; // At least challenge 1 is unlocked

    const completedCount = challenges.filter(c => 
      progress[c.id]?.completed
    ).length;

    const totalScore = Object.values(progress).reduce((sum, p) => 
      sum + (p.score || 0), 0
    );

    const progressPercentage = (completedCount / 5) * 100; // 5 total challenges

    return {
      unlocked: unlockedCount,
      completed: completedCount,
      totalScore,
      progressPercentage
    };
  };

  const stats = calculateStats();

  // Animate numbers counting up
  useEffect(() => {
    const animateStats = async () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedStats({
          unlocked: Math.floor(stats.unlocked * easeOut),
          completed: Math.floor(stats.completed * easeOut),
          totalScore: Math.floor(stats.totalScore * easeOut),
          progressPercentage: stats.progressPercentage * easeOut
        });

        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    };

    animateStats();
  }, [stats.unlocked, stats.completed, stats.totalScore, stats.progressPercentage]);

  const getRankInfo = () => {
    const { completed, totalScore } = stats;
    
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

  const rankInfo = getRankInfo();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="progress-overview"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="progress-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          Your Progress
        </h2>
        <motion.div 
          className="rank-badge"
          whileHover={{ scale: 1.05 }}
          style={{ backgroundColor: rankInfo.color }}
        >
          <i className={rankInfo.icon}></i>
          <span>{rankInfo.rank}</span>
        </motion.div>
      </div>

      {/* Progress Stats Grid */}
      <div className="progress-stats">
        <motion.div className="stat-card" variants={statVariants}>
          <motion.div 
            className="stat-number"
            key={animatedStats.unlocked}
            initial={{ scale: 1.2, color: '#0cc0df' }}
            animate={{ scale: 1, color: '#0cc0df' }}
            transition={{ duration: 0.3 }}
          >
            {animatedStats.unlocked}
          </motion.div>
          <div className="stat-label">Challenges Unlocked</div>
          <div className="stat-icon">
            <i className="fas fa-unlock-alt"></i>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={statVariants}>
          <motion.div 
            className="stat-number"
            key={animatedStats.completed}
            initial={{ scale: 1.2, color: '#28a745' }}
            animate={{ scale: 1, color: '#28a745' }}
            transition={{ duration: 0.3 }}
          >
            {animatedStats.completed}
          </motion.div>
          <div className="stat-label">Challenges Completed</div>
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={statVariants}>
          <motion.div 
            className="stat-number"
            key={animatedStats.totalScore}
            initial={{ scale: 1.2, color: '#ffd60a' }}
            animate={{ scale: 1, color: '#ffd60a' }}
            transition={{ duration: 0.3 }}
          >
            {animatedStats.totalScore}
          </motion.div>
          <div className="stat-label">Total Score</div>
          <div className="stat-icon">
            <i className="fas fa-trophy"></i>
          </div>
        </motion.div>

        <motion.div className="stat-card rank-card" variants={statVariants}>
          <div className="stat-number" style={{ color: rankInfo.color }}>
            <i className={rankInfo.icon}></i>
          </div>
          <div className="stat-label">Current Rank</div>
          <div className="rank-name" style={{ color: rankInfo.color }}>
            {rankInfo.rank}
          </div>
        </motion.div>
      </div>

      {/* Overall Progress Bar */}
      <motion.div 
        className="overall-progress"
        variants={statVariants}
      >
        <div className="progress-info">
          <h3>Overall Progress</h3>
          <span className="progress-percentage">
            {Math.round(animatedStats.progressPercentage)}%
          </span>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${animatedStats.progressPercentage}%` }}
              transition={{ 
                duration: 2,
                ease: "easeOut",
                delay: 0.5
              }}
            />
            <motion.div 
              className="progress-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: animatedStats.progressPercentage > 0 ? 1 : 0 }}
              transition={{ duration: 1, delay: 1 }}
            />
          </div>
          
          {/* Progress Milestones */}
          <div className="progress-milestones">
            {[0, 20, 40, 60, 80, 100].map((milestone, index) => (
              <motion.div 
                key={milestone}
                className={`milestone ${animatedStats.progressPercentage >= milestone ? 'reached' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                style={{ left: `${milestone}%` }}
              >
                <div className="milestone-dot"></div>
                <span className="milestone-label">{milestone}%</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <p className="progress-description">
          {animatedStats.completed} of 5 challenges completed
          {animatedStats.completed > 0 && (
            <span> • Next: Challenge {animatedStats.unlocked + 1}</span>
          )}
        </p>
      </motion.div>

      {/* Achievement Indicators */}
      <motion.div 
        className="achievement-indicators"
        variants={statVariants}
      >
        {stats.completed >= 1 && (
          <motion.div 
            className="achievement-badge first-challenge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 2 }}
          >
            <i className="fas fa-play"></i>
            <span>First Steps</span>
          </motion.div>
        )}
        
        {stats.totalScore >= 100 && (
          <motion.div 
            className="achievement-badge century"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 2.2 }}
          >
            <i className="fas fa-hundred-points"></i>
            <span>Century Club</span>
          </motion.div>
        )}

        {stats.completed >= 3 && (
          <motion.div 
            className="achievement-badge halfway"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 2.4 }}
          >
            <i className="fas fa-mountain"></i>
            <span>Halfway There</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProgressTracker;