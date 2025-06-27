// src/components/challenges/ChallengeMap.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Zoom
} from '@mui/material';
import {
  PlayArrow,
  Lock,
  CheckCircle,
  Info,
  Star,
  AccessTime,
  Psychology,
  GpsFixed,  // ✅ Replace with this
  Speed,
  Engineering,
  Close,
  Rocket
} from '@mui/icons-material';

// Challenge type icons mapping
// AFTER (Line 35):
const challengeIcons = {
  'manual_movement': GpsFixed,  // ✅ Use the new icon
  'quiz': Psychology,
  'pd_control': Speed,
  'workspace': Engineering,
  'orientation': Rocket,
  'default': Star
};

// Enhanced individual challenge card
const EnhancedChallengeCard = ({ challenge, delay = 0, onShowDetails, onStartChallenge }) => {
  const navigate = useNavigate();
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      case 'expert': return '#6f42c1';
      default: return '#28a745';
    }
  };

  const getStatusInfo = () => {
    if (challenge.is_completed) {
      return {
        icon: CheckCircle,
        text: `Completed - ${challenge.best_score || 0}%`,
        color: '#28a745',
        bgColor: 'rgba(40, 167, 69, 0.1)',
        borderColor: 'rgba(40, 167, 69, 0.3)'
      };
    }
    if (challenge.is_unlocked) {
      return {
        icon: PlayArrow,
        text: 'Available',
        color: '#0cc0df',
        bgColor: 'rgba(12, 192, 223, 0.1)',
        borderColor: 'rgba(12, 192, 223, 0.3)'
      };
    }
    return {
      icon: Lock,
      text: 'Locked',
      color: '#6c757d',
      bgColor: 'rgba(108, 117, 125, 0.1)',
      borderColor: 'rgba(108, 117, 125, 0.3)'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const ChallengeIcon = challengeIcons[challenge.challenge_type] || challengeIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.2 }
      }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          bgcolor: 'rgba(0, 8, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          border: challenge.is_completed 
            ? '2px solid rgba(40, 167, 69, 0.5)'
            : challenge.is_unlocked 
              ? '1px solid rgba(12, 192, 223, 0.3)'
              : '1px solid rgba(108, 117, 125, 0.3)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          cursor: challenge.is_unlocked ? 'pointer' : 'default',
          opacity: challenge.is_unlocked ? 1 : 0.7,
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: challenge.is_unlocked 
              ? 'linear-gradient(90deg, transparent, rgba(12, 192, 223, 0.1), transparent)'
              : 'none',
            transition: 'left 0.6s ease'
          },
          '&:hover::before': {
            left: challenge.is_unlocked ? '100%' : '-100%'
          },
          '&:hover': {
            boxShadow: challenge.is_unlocked 
              ? '0 20px 40px rgba(12, 192, 223, 0.3)'
              : 'none',
            borderColor: challenge.is_unlocked 
              ? 'rgba(12, 192, 223, 0.6)'
              : 'rgba(108, 117, 125, 0.3)'
          }
        }}
        onClick={() => challenge.is_unlocked && onStartChallenge(challenge)}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Challenge Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: challenge.is_unlocked ? '#0cc0df' : '#6c757d',
                opacity: 0.8
              }}
            >
              {String(challenge.id || challenge.challenge_id || '').padStart(2, '0')}
            </Typography>
            <Chip
              label={challenge.difficulty || 'Beginner'}
              size="small"
              sx={{
                background: `linear-gradient(45deg, ${getDifficultyColor(challenge.difficulty)}, ${getDifficultyColor(challenge.difficulty)}dd)`,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          </Box>

          {/* Challenge Icon & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <motion.div
              animate={challenge.is_unlocked ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: challenge.is_unlocked ? Infinity : 0,
                repeatDelay: 3
              }}
            >
              <ChallengeIcon 
                sx={{ 
                  fontSize: 32, 
                  color: challenge.is_unlocked ? '#0cc0df' : '#6c757d'
                }} 
              />
            </motion.div>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2
              }}
            >
              {challenge.title || challenge.name}
            </Typography>
          </Box>

          {/* Description */}
          <Typography 
            variant="body2" 
            color="rgba(168, 218, 220, 0.9)"
            sx={{ 
              mb: 3,
              lineHeight: 1.6,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {challenge.description}
          </Typography>

          {/* Challenge Features/Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {challenge.estimated_time && (
              <Chip
                icon={<AccessTime sx={{ fontSize: '1rem !important' }} />}
                label={`${challenge.estimated_time}min`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.7rem'
                }}
              />
            )}
            {challenge.challenge_type && (
              <Chip
                label={challenge.challenge_type.replace('_', ' ')}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(12, 192, 223, 0.5)',
                  color: '#0cc0df',
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>

          {/* Progress Bar for Completed Challenges */}
          {challenge.is_completed && challenge.best_score && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="rgba(168, 218, 220, 0.8)">
                  Best Score
                </Typography>
                <Typography variant="caption" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                  {challenge.best_score}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.best_score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #28a745, #20c997)',
                    borderRadius: 4
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Actions & Status */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <motion.div style={{ flex: 1 }}>
                <Button
                  variant={challenge.is_unlocked ? 'contained' : 'outlined'}
                  size="medium"
                  fullWidth
                  startIcon={<StatusIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (challenge.is_unlocked) {
                      onStartChallenge(challenge);
                    }
                  }}
                  disabled={!challenge.is_unlocked}
                  sx={{
                    borderRadius: '8px',
                    ...(challenge.is_unlocked ? {
                      background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                      boxShadow: '0 4px 15px rgba(12, 192, 223, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #007acc, #0cc0df)',
                        boxShadow: '0 6px 20px rgba(12, 192, 223, 0.4)'
                      }
                    } : {
                      borderColor: 'rgba(108, 117, 125, 0.5)',
                      color: 'rgba(108, 117, 125, 0.8)'
                    })
                  }}
                >
                  {challenge.is_completed ? 'Retry' : 
                   challenge.is_unlocked ? 'Start' : 'Locked'}
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowDetails(challenge);
                  }}
                  sx={{
                    color: '#0cc0df',
                    bgcolor: 'rgba(12, 192, 223, 0.1)',
                    border: '1px solid rgba(12, 192, 223, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(12, 192, 223, 0.2)',
                      borderColor: 'rgba(12, 192, 223, 0.5)'
                    }
                  }}
                >
                  <Info />
                </IconButton>
              </motion.div>
            </Box>

            {/* Status Indicator */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1,
                borderRadius: '8px',
                bgcolor: statusInfo.bgColor,
                border: `1px solid ${statusInfo.borderColor}`
              }}
            >
              <StatusIcon sx={{ fontSize: '1rem', color: statusInfo.color }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: statusInfo.color,
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
              >
                {statusInfo.text}
              </Typography>
            </Box>
          </Box>

          {/* Completion Badge */}
          <AnimatePresence>
            {challenge.is_completed && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'linear-gradient(45deg, #ffd60a, #ffba08)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(255, 214, 10, 0.4)',
                  zIndex: 1
                }}
              >
                <Star sx={{ fontSize: 20 }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlock Animation */}
          {challenge.is_unlocked && !challenge.is_completed && (
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                width: '50px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                pointerEvents: 'none'
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 2
              }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Challenge Details Dialog
const ChallengeDetailsDialog = ({ challenge, open, onClose }) => {
  if (!challenge) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 8, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(12, 192, 223, 0.3)',
          borderRadius: '16px',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'rgba(12, 192, 223, 0.1)',
        borderBottom: '1px solid rgba(12, 192, 223, 0.3)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0cc0df' }}>
          Challenge {challenge.id || challenge.challenge_id}: {challenge.title || challenge.name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ color: '#ffd60a', fontWeight: 'bold', mb: 1 }}>
              Challenge Type
            </Typography>
            <Typography variant="body2" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 2 }}>
              {challenge.challenge_type?.replace('_', ' ') || challenge.type || 'General'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ color: '#ffd60a', fontWeight: 'bold', mb: 1 }}>
              Difficulty
            </Typography>
            <Typography variant="body2" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 2 }}>
              {challenge.difficulty || 'Beginner'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: '#ffd60a', fontWeight: 'bold', mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 2, lineHeight: 1.6 }}>
              {challenge.description}
            </Typography>
          </Grid>
          
          {challenge.estimated_time && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: '#ffd60a', fontWeight: 'bold', mb: 1 }}>
                Estimated Time
              </Typography>
              <Typography variant="body2" color="rgba(168, 218, 220, 0.9)">
                {challenge.estimated_time} minutes
              </Typography>
            </Grid>
          )}
          
          {challenge.best_score && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: '#ffd60a', fontWeight: 'bold', mb: 1 }}>
                Your Best Score
              </Typography>
              <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                {challenge.best_score}%
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(12, 192, 223, 0.3)' }}>
        <Button onClick={onClose} sx={{ color: 'rgba(168, 218, 220, 0.8)' }}>
          Close
        </Button>
        {challenge.is_unlocked && (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            sx={{
              background: 'linear-gradient(45deg, #0cc0df, #007acc)',
              '&:hover': {
                background: 'linear-gradient(45deg, #007acc, #0cc0df)'
              }
            }}
            onClick={() => {
              onClose();
              // Navigate to challenge
            }}
          >
            Start Challenge
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Main ChallengeMap Component
const ChallengeMap = ({ challenges = [] }) => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleShowDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setDetailsOpen(true);
  };

  const handleStartChallenge = (challenge) => {
    if (challenge.is_unlocked) {
      navigate(`/challenge/${challenge.id || challenge.challenge_id}`);
    }
  };

  // ✅ FIXED: Safe sorting that handles both string and number IDs
  const sortedChallenges = [...challenges].sort((a, b) => {
    // Safely convert ID to string first, then extract numbers
    const getNumericId = (challenge) => {
      const id = challenge.id || challenge.challenge_id || '';
      const idStr = String(id); // Convert to string safely
      const match = idStr.match(/\d+/); // Extract numbers
      return match ? parseInt(match[0], 10) : 0;
    };

    const aId = getNumericId(a);
    const bId = getNumericId(b);
    
    return aId - bId;
  });

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

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {sortedChallenges.map((challenge, index) => (
            <Grid item xs={12} sm={6} lg={4} key={challenge.id || challenge.challenge_id || index}>
              <EnhancedChallengeCard
                challenge={challenge}
                delay={index * 0.1}
                onShowDetails={handleShowDetails}
                onStartChallenge={handleStartChallenge}
              />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <ChallengeDetailsDialog
        challenge={selectedChallenge}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};

export default ChallengeMap;