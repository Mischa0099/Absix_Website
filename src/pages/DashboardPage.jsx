// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  TrendingUp, 
  Timer, 
  Star,
  PlayArrow,
  Leaderboard as LeaderboardIcon,
  EmojiEvents,
  Speed,
  Psychology,
  Rocket
} from '@mui/icons-material';
import { fetchChallenges, fetchUserProgress } from '../store/challengeSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChallengeMap from '../components/challenges/ChallengeMap';
import { getRank, getScoreColor, calculateProgress } from '../utils/helpers';

// Enhanced animated background component
const AnimatedBackground = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    delay: Math.random() * 20,
    duration: Math.random() * 10 + 15,
    left: Math.random() * 100
  }));

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'rgba(12, 192, 223, 0.5)',
            borderRadius: '50%',
            left: `${particle.left}%`
          }}
          animate={{
            y: [-100, window.innerHeight + 100],
            x: [0, 100],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </Box>
  );
};

// Enhanced stats card component
const AnimatedStatsCard = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 }
      }}
      style={{ height: '100%' }}
    >
      <Card 
        sx={{ 
          bgcolor: 'rgba(0, 8, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(12, 192, 223, 0.3)',
          borderRadius: '16px',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(12, 192, 223, 0.1), transparent)',
            transition: 'left 0.6s ease'
          },
          '&:hover::before': {
            left: '100%'
          },
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Animated number counter
const AnimatedNumber = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animateNumber = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(Math.floor(value * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };
    requestAnimationFrame(animateNumber);
  }, [value, duration]);

  return (
    <motion.span
      key={currentValue}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{currentValue}{suffix}
    </motion.span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { challenges, userProgress, loading } = useSelector(state => state.challenges);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    dispatch(fetchChallenges());
    dispatch(fetchUserProgress());
    
    // Hide welcome animation after 3 seconds
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <Box 
        className="flex-center" 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000814, #001d3d, #003566)',
          position: 'relative'
        }}
      >
        <AnimatedBackground />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner message="Initializing Aurora Rising Dashboard..." />
        </motion.div>
      </Box>
    );
  }

  // Calculate stats
  const completedChallenges = challenges?.filter(c => c.is_completed) || [];
  const totalChallenges = challenges?.length || 0;
  const averageScore = completedChallenges.length > 0 ? 
    Math.round(completedChallenges.reduce((sum, c) => sum + (c.best_score || 0), 0) / completedChallenges.length) : 0;
  const progressPercentage = calculateProgress(completedChallenges.length, totalChallenges);
  const userRank = getRank(completedChallenges.length, userProgress?.totalScore || 0);
  const nextChallenge = challenges?.find(c => !c.is_completed && c.is_unlocked);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000814, #001d3d, #003566)',
        position: 'relative',
        color: 'white'
      }}
    >
      <AnimatedBackground />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header with Animations */}
            <motion.div variants={itemVariants}>
              <Box className="text-center" sx={{ mb: 6 }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #0cc0df, #ffd60a)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(12, 192, 223, 0.5)',
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    Aurora Rising Dashboard
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Typography 
                    variant="h5" 
                    color="rgba(168, 218, 220, 0.9)" 
                    gutterBottom
                    sx={{ mb: 3 }}
                  >
                    Welcome back, {user?.username || 'Student'}! Master robotics through hands-on challenges.
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.6, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                >
                  <Chip
                    label={userRank}
                    sx={{ 
                      mt: 2, 
                      fontSize: '1.2rem', 
                      py: 3,
                      px: 2,
                      background: 'linear-gradient(45deg, #0cc0df, #ffd60a)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(12, 192, 223, 0.4)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s ease'
                      }
                    }}
                    icon={<EmojiEvents />}
                  />
                </motion.div>
              </Box>
            </motion.div>

            {/* Enhanced Progress Overview Cards */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <AnimatedStatsCard delay={0.1}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <School sx={{ fontSize: 48, color: '#0cc0df', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0cc0df' }}>
                      <AnimatedNumber value={completedChallenges.length} />
                    </Typography>
                    <Typography variant="body2" color="rgba(168, 218, 220, 0.9)">
                      Challenges Completed
                    </Typography>
                    <Typography variant="caption" color="rgba(168, 218, 220, 0.7)">
                      out of {totalChallenges}
                    </Typography>
                  </CardContent>
                </AnimatedStatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedStatsCard delay={0.2}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <motion.div
                      animate={{ 
                        rotate: [0, -5, 5, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <Star sx={{ fontSize: 48, color: '#ffd60a', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffd60a' }}>
                      <AnimatedNumber value={userProgress?.totalScore || 0} />
                    </Typography>
                    <Typography variant="body2" color="rgba(168, 218, 220, 0.9)">
                      Total Score
                    </Typography>
                    <Typography variant="caption" color="rgba(168, 218, 220, 0.7)">
                      points earned
                    </Typography>
                  </CardContent>
                </AnimatedStatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedStatsCard delay={0.3}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity, repeatDelay: 4 },
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 48, color: '#28a745', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                      <AnimatedNumber value={averageScore} suffix="%" />
                    </Typography>
                    <Typography variant="body2" color="rgba(168, 218, 220, 0.9)">
                      Average Score
                    </Typography>
                    <Typography variant="caption" color="rgba(168, 218, 220, 0.7)">
                      across all attempts
                    </Typography>
                  </CardContent>
                </AnimatedStatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedStatsCard delay={0.4}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, -15, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <Speed sx={{ fontSize: 48, color: '#ff6b35', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b35' }}>
                      <AnimatedNumber value={progressPercentage} suffix="%" />
                    </Typography>
                    <Typography variant="body2" color="rgba(168, 218, 220, 0.9)">
                      Progress
                    </Typography>
                    <Typography variant="caption" color="rgba(168, 218, 220, 0.7)">
                      overall completion
                    </Typography>
                  </CardContent>
                </AnimatedStatsCard>
              </Grid>
            </Grid>

            {/* Enhanced Progress Bar */}
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                mb: 6, 
                bgcolor: 'rgba(0, 8, 20, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(12, 192, 223, 0.3)',
                borderRadius: '16px'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
                      🚀 Learning Progress
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                      {completedChallenges.length} / {totalChallenges} completed
                    </Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressPercentage} 
                      sx={{ 
                        height: 16, 
                        borderRadius: 8,
                        bgcolor: 'rgba(0, 53, 102, 0.5)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background: 'linear-gradient(90deg, #0cc0df, #ffd60a)',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }
                        }
                      }} 
                    />
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        left: 0,
                        width: '100%',
                        height: '24px',
                        background: 'radial-gradient(ellipse, rgba(12, 192, 223, 0.3), transparent)',
                        borderRadius: '12px',
                        opacity: progressPercentage > 0 ? 1 : 0
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: progressPercentage > 0 ? 1 : 0 }}
                      transition={{ duration: 1, delay: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" sx={{ textAlign: 'center' }}>
                    Keep going! You're making great progress in your robotics journey. 🎯
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Next Challenge Recommendation */}
            <AnimatePresence>
              {nextChallenge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5 }}
                  variants={itemVariants}
                >
                  <Card sx={{ 
                    mb: 6, 
                    bgcolor: 'rgba(0, 8, 20, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 214, 10, 0.5)',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(255, 214, 10, 0.3)'
                  }}>
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 214, 10, 0.1), transparent)'
                      }}
                      animate={{ left: ['100%', '-100%'] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <CardContent sx={{ p: 4 }}>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                          🎯 Recommended Next Challenge
                        </Typography>
                      </motion.div>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                            Challenge {nextChallenge.id}: {nextChallenge.title}
                          </Typography>
                          <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 2 }}>
                            {nextChallenge.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={nextChallenge.difficulty || 'Beginner'} 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(45deg, #28a745, #20c997)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                            <Chip 
                              label={`~${nextChallenge.estimated_time || 30} min`} 
                              size="small" 
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<Rocket />}
                              onClick={() => navigate(`/challenge/${nextChallenge.id}`)}
                              fullWidth
                              sx={{
                                background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                                boxShadow: '0 8px 25px rgba(12, 192, 223, 0.4)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #007acc, #0cc0df)',
                                  boxShadow: '0 12px 30px rgba(12, 192, 223, 0.6)'
                                }
                              }}
                            >
                              Start Challenge
                            </Button>
                          </motion.div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Quick Actions */}
            <motion.div variants={itemVariants}>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={6}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper sx={{ 
                      p: 4, 
                      bgcolor: 'rgba(0, 8, 20, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(12, 192, 223, 0.3)',
                      borderRadius: '16px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Psychology sx={{ fontSize: 48, color: '#0cc0df', mb: 2 }} />
                      </motion.div>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        All Challenges
                      </Typography>
                      <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" sx={{ mb: 3 }}>
                        View and access all available robotics challenges.
                      </Typography>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          onClick={() => {
                            document.getElementById('challenges-section')?.scrollIntoView({ 
                              behavior: 'smooth' 
                            });
                          }}
                          sx={{
                            background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                            boxShadow: '0 8px 25px rgba(12, 192, 223, 0.4)'
                          }}
                        >
                          Browse Challenges
                        </Button>
                      </motion.div>
                    </Paper>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper sx={{ 
                      p: 4, 
                      bgcolor: 'rgba(0, 8, 20, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 214, 10, 0.3)',
                      borderRadius: '16px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <LeaderboardIcon sx={{ fontSize: 48, color: '#ffd60a', mb: 2 }} />
                      </motion.div>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        Leaderboard
                      </Typography>
                      <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" sx={{ mb: 3 }}>
                        See how you rank against other students.
                      </Typography>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<EmojiEvents />}
                          onClick={() => navigate('/leaderboard')}
                          fullWidth
                          sx={{
                            borderColor: '#ffd60a',
                            color: '#ffd60a',
                            '&:hover': {
                              borderColor: '#ffd60a',
                              background: 'rgba(255, 214, 10, 0.1)'
                            }
                          }}
                        >
                          View Rankings
                        </Button>
                      </motion.div>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>

            {/* Enhanced Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                mb: 6, 
                bgcolor: 'rgba(0, 8, 20, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(12, 192, 223, 0.3)',
                borderRadius: '16px'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
                    📈 Recent Activity
                  </Typography>
                  {completedChallenges.length > 0 ? (
                    <Grid container spacing={2}>
                      {completedChallenges.slice(-6).reverse().map((challenge, index) => (
                        <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ 
                              y: -5,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <Paper 
                              sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(255,255,255,0.05)', 
                                cursor: 'pointer',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { 
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  borderColor: 'rgba(12, 192, 223, 0.5)'
                                }
                              }}
                              onClick={() => navigate(`/challenge/${challenge.id}`)}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                                Challenge {challenge.id}
                              </Typography>
                              <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" sx={{ mb: 2 }}>
                                {challenge.title}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Chip
                                    label={`${challenge.best_score || 0}%`}
                                    size="small"
                                    sx={{ 
                                      background: getScoreColor(challenge.best_score || 0),
                                      color: 'white',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                                    }}
                                  />
                                </motion.div>
                                <Typography variant="caption" color="rgba(168, 218, 220, 0.6)">
                                  ✅ Completed
                                </Typography>
                              </Box>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Box className="text-center" sx={{ py: 6 }}>
                        <motion.div
                          animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity
                          }}
                        >
                          <Rocket sx={{ fontSize: 64, color: 'rgba(168, 218, 220, 0.5)', mb: 2 }} />
                        </motion.div>
                        <Typography variant="h6" color="rgba(168, 218, 220, 0.8)" sx={{ mb: 1 }}>
                          No completed challenges yet.
                        </Typography>
                        <Typography variant="body2" color="rgba(168, 218, 220, 0.6)">
                          Start your first challenge to see your activity here! 🚀
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Challenges Section */}
            <motion.div 
              id="challenges-section"
              variants={itemVariants}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity
                  }}
                >
                  <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #0cc0df, #ffd60a)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    🎯 All Challenges
                  </Typography>
                </motion.div>
                <Typography 
                  variant="h6" 
                  color="rgba(168, 218, 220, 0.9)" 
                  sx={{ mb: 4 }}
                >
                  Choose from a variety of robotics challenges designed to build your skills progressively
                </Typography>
              </Box>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ChallengeMap challenges={challenges} />
              </motion.div>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(12, 192, 223, 0.5)); }
          50% { filter: drop-shadow(0 0 30px rgba(255, 214, 10, 0.5)); }
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #0cc0df #000814;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: #000814;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #0cc0df, #007acc);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #007acc, #0cc0df);
        }
      `}</style>
    </Box>
  );
};

export default DashboardPage;