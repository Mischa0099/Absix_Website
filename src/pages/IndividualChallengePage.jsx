// src/pages/IndividualChallengePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack, 
  Home,
  NavigateNext,
  PlayArrow,
  School,
  Warning,
  Info
} from '@mui/icons-material';

// Import your existing challenge registry
import { getChallengeComponent } from '../components/challenges/challengeRegistry';
// Import existing challenge components
import { Challenge1 } from '../components/challenges';
import ChallengeRunner from '../components/challenges/ChallengeRunner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { challengeDetailsData } from '../utils/ChallengeData';
import { fetchChallenge, setCurrentChallenge } from '../store/challengeSlice';
import { connectRobot, fetchRobotStatus } from '../store/robotSlice';
import { getDifficultyColor } from '../utils/helpers';

const IndividualChallengePage = () => {
  const { challengeId, id } = useParams(); // Support both challengeId and id params
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use challengeId or id, whichever is available
  const currentChallengeId = challengeId || id;
  
  const { currentChallenge, loading, error } = useSelector(state => state.challenges);
  const { connected, connectionStatus } = useSelector(state => state.robot);
  const { user } = useSelector(state => state.auth);
  
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Get challenge configuration from your registry
  const challengeConfig = getChallengeComponent(currentChallengeId);

  useEffect(() => {
    if (currentChallengeId) {
      dispatch(fetchChallenge(currentChallengeId));
      dispatch(setCurrentChallenge(currentChallengeId));
      
      // Try to get robot status
      dispatch(fetchRobotStatus());
    }
  }, [currentChallengeId, dispatch]);

  const handleComplete = (result) => {
    console.log('Challenge completed:', result);
    setChallengeStarted(false);
    
    // Navigate back with success message
    navigate('/dashboard', { 
      state: { 
        message: result.success ? 'Challenge completed successfully!' : 'Challenge attempt recorded.',
        type: result.success ? 'success' : 'info'
      } 
    });
  };

  const handleStartChallenge = () => {
    setChallengeStarted(true);
    setShowInstructions(false);
    
    // Connect to robot if not already connected and if challenge requires hardware
    if (challengeConfig?.requiresWebSerial && !connected && connectionStatus !== 'connecting') {
      dispatch(connectRobot());
    }
  };

  // Render specific challenge component based on ID
  const renderChallengeComponent = () => {
    // First check if challenge exists in registry (new dynamic system)
    if (challengeConfig && challengeConfig.component) {
      const ChallengeComponent = challengeConfig.component;
      return <ChallengeComponent onComplete={handleComplete} />;
    }

    // Fallback to old hardcoded system for backwards compatibility
    switch (currentChallengeId) {
      case 'C1':
        return (
          <Challenge1 
            challenge={currentChallenge} 
            onComplete={handleComplete} 
          />
        );
      case 'C2':
      case 'C3':
      case 'C4':
      case 'C5':
        // Use ChallengeRunner for other challenges
        return (
          <ChallengeRunner 
            challenge={currentChallenge} 
            onComplete={handleComplete} 
          />
        );
      default:
        return (
          <ChallengeRunner 
            challenge={currentChallenge} 
            onComplete={handleComplete} 
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="60vh"
          gap={2}
        >
          <LoadingSpinner message="Loading challenge..." />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // Challenge not found in registry or Redux store
  if (!challengeConfig && !currentChallenge) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2, color: 'rgba(168, 218, 220, 0.8)' }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
            Challenge Not Found
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Challenge {currentChallengeId} not found!</strong> 
          The requested challenge doesn't exist or hasn't been implemented yet.
        </Alert>

        <Card sx={{ 
          bgcolor: 'rgba(0, 8, 20, 0.9)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
              ❌ Challenge "{currentChallengeId}" Not Available
            </Typography>
            <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 3 }}>
              This challenge hasn't been implemented yet. Please check back later or try a different challenge.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #007acc, #0cc0df)'
                  }
                }}
              >
                Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Get challenge data from registry or Redux store
  const challengeData = challengeConfig ? {
    id: currentChallengeId,
    title: challengeConfig.title,
    description: challengeConfig.description,
    difficulty: challengeConfig.difficulty,
    estimated_time: challengeConfig.estimatedTime,
    type: challengeConfig.type,
    requiresWebSerial: challengeConfig.requiresWebSerial,
    is_unlocked: true, // Default to unlocked for now
    is_completed: false, // This should come from user progress
    best_score: 0,
    instructions: challengeDetailsData[currentChallengeId]?.instructions,
    learning_objectives: challengeDetailsData[currentChallengeId]?.objectives
  } : currentChallenge;

  // For challenges that render directly (like C1 with full interface)
  if (challengeConfig && challengeStarted && ['C1'].includes(currentChallengeId)) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2, color: 'rgba(168, 218, 220, 0.8)' }}
          >
            Back to Dashboard
          </Button>
          <Box>
            <Typography variant="h4" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
              🤖 Challenge {currentChallengeId}: {challengeData.title}
            </Typography>
            <Typography variant="subtitle1" color="rgba(168, 218, 220, 0.9)">
              {challengeData.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={challengeData.type}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(12, 192, 223, 0.2)', 
                  color: '#0cc0df',
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={challengeData.difficulty}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(40, 167, 69, 0.2)', 
                  color: '#28a745',
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={`~${challengeData.estimated_time} min`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 193, 7, 0.2)', 
                  color: '#ffc107',
                  fontSize: '0.75rem'
                }}
              />
              {challengeData.requiresWebSerial && (
                <Chip
                  label="WebSerial Required"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(139, 92, 246, 0.2)', 
                    color: '#8b5cf6',
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* WebSerial Warning for hardware challenges */}
        {challengeData.requiresWebSerial && !('serial' in navigator) && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            <strong>⚠️ WebSerial API not supported!</strong> 
            This challenge requires a browser that supports WebSerial API (Chrome 89+, Edge 89+) to communicate with hardware.
          </Alert>
        )}

        {/* Render the challenge component directly */}
        {renderChallengeComponent()}
      </Container>
    );
  }

  // For other challenges, use the full layout with instructions
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          sx={{ mb: 3 }}
          aria-label="breadcrumb"
        >
          <Link 
            color="inherit" 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: 'rgba(168, 218, 220, 0.8)',
              '&:hover': { color: '#0cc0df' }
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/dashboard"
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
            sx={{ 
              textDecoration: 'none',
              color: 'rgba(168, 218, 220, 0.8)',
              '&:hover': { color: '#0cc0df' }
            }}
          >
            Dashboard
          </Link>
          <Typography sx={{ color: '#0cc0df' }}>
            Challenge {challengeData.id}
          </Typography>
        </Breadcrumbs>

        {/* Navigation Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ 
            mb: 3,
            color: 'rgba(168, 218, 220, 0.8)',
            borderColor: 'rgba(168, 218, 220, 0.3)',
            '&:hover': {
              color: '#0cc0df',
              borderColor: 'rgba(12, 192, 223, 0.5)'
            }
          }}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        
        {/* Challenge Header */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          bgcolor: 'rgba(0, 8, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(12, 192, 223, 0.3)',
          borderRadius: '16px'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
                Challenge {challengeData.id}: {challengeData.title}
              </Typography>
              <Typography variant="h6" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 2 }}>
                {challengeData.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={challengeData.difficulty || 'Beginner'}
                  sx={{
                    backgroundColor: getDifficultyColor(challengeData.difficulty),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                
                {challengeData.estimated_time && (
                  <Chip
                    label={`~${challengeData.estimated_time} min`}
                    variant="outlined"
                    sx={{ 
                      borderColor: 'rgba(12, 192, 223, 0.5)',
                      color: '#0cc0df'
                    }}
                  />
                )}
                
                {challengeData.best_score > 0 && (
                  <Chip
                    label={`Best Score: ${challengeData.best_score}%`}
                    sx={{ 
                      bgcolor: 'rgba(40, 167, 69, 0.2)',
                      color: '#28a745',
                      border: '1px solid rgba(40, 167, 69, 0.5)'
                    }}
                  />
                )}
                
                <Chip
                  label={challengeData.is_completed ? 'Completed' : challengeData.is_unlocked ? 'Available' : 'Locked'}
                  sx={{
                    bgcolor: challengeData.is_completed ? 'rgba(40, 167, 69, 0.2)' : 
                           challengeData.is_unlocked ? 'rgba(12, 192, 223, 0.2)' : 'rgba(108, 117, 125, 0.2)',
                    color: challengeData.is_completed ? '#28a745' : 
                           challengeData.is_unlocked ? '#0cc0df' : '#6c757d',
                    border: `1px solid ${challengeData.is_completed ? 'rgba(40, 167, 69, 0.5)' : 
                                        challengeData.is_unlocked ? 'rgba(12, 192, 223, 0.5)' : 'rgba(108, 117, 125, 0.5)'}`
                  }}
                />

                {challengeData.requiresWebSerial && (
                  <Chip
                    label="Hardware Required"
                    icon={<Warning />}
                    sx={{ 
                      bgcolor: 'rgba(139, 92, 246, 0.2)',
                      color: '#8b5cf6',
                      border: '1px solid rgba(139, 92, 246, 0.5)'
                    }}
                  />
                )}
              </Box>
            </Box>
            
            {!challengeStarted && challengeData.is_unlocked && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleStartChallenge}
                  sx={{ 
                    minWidth: 160,
                    background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #007acc, #0cc0df)',
                      boxShadow: '0 6px 20px rgba(12, 192, 223, 0.4)'
                    }
                  }}
                >
                  Start Challenge
                </Button>
              </motion.div>
            )}
          </Box>

          {/* Challenge Instructions */}
          {challengeData.instructions && showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                  📋 Instructions
                </Typography>
                <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ lineHeight: 1.6 }}>
                  {challengeData.instructions}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Learning Objectives */}
          {challengeData.learning_objectives && showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                  🎯 Learning Objectives
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {challengeData.learning_objectives.map((objective, index) => (
                    <Typography 
                      component="li" 
                      key={index} 
                      variant="body2" 
                      color="rgba(168, 218, 220, 0.9)"
                      sx={{ mb: 0.5, lineHeight: 1.5 }}
                    >
                      {objective}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </motion.div>
          )}
        </Paper>

        {/* WebSerial Warning for hardware challenges */}
        {challengeData.requiresWebSerial && !('serial' in navigator) && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            <strong>⚠️ WebSerial API not supported!</strong> 
            This challenge requires a browser that supports WebSerial API (Chrome 89+, Edge 89+) to communicate with hardware.
          </Alert>
        )}

        {/* Connection Status */}
        {challengeData.requiresWebSerial && !connected && challengeStarted && (
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ mb: 3 }}
          >
            {connectionStatus === 'connecting' 
              ? 'Connecting to robot hardware...' 
              : 'Robot hardware not connected. Challenge will run in simulation mode.'
            }
          </Alert>
        )}

        {/* Challenge Runner */}
        {challengeStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderChallengeComponent()}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center', 
              bgcolor: 'rgba(0, 8, 20, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(12, 192, 223, 0.3)',
              borderRadius: '16px'
            }}>
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
              >
                <School sx={{ fontSize: 64, color: '#0cc0df', mb: 2 }} />
              </motion.div>
              
              <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                Ready to Start?
              </Typography>
              <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                This challenge will test your understanding of robotics concepts and give you hands-on experience with robot control. 
                Make sure you're ready to learn and experiment!
              </Typography>
              
              {challengeData.is_unlocked ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={handleStartChallenge}
                    sx={{
                      minWidth: 200,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #007acc, #0cc0df)',
                        boxShadow: '0 8px 25px rgba(12, 192, 223, 0.4)'
                      }
                    }}
                  >
                    Begin Challenge
                  </Button>
                </motion.div>
              ) : (
                <Alert 
                  severity="warning"
                  sx={{ 
                    maxWidth: 500, 
                    mx: 'auto',
                    bgcolor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    color: '#ffc107'
                  }}
                >
                  This challenge is locked. Complete previous challenges to unlock it.
                </Alert>
              )}
            </Paper>
          </motion.div>
        )}
      </Box>
    </Container>
  );
};

export default IndividualChallengePage;