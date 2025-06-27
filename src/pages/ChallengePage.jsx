// src/pages/ChallengePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack, 
  PlayArrow, 
  Stop, 
  Refresh, 
  Home,
  Info,
  CheckCircle,
  Lock
} from '@mui/icons-material';
import challengeService from '../services/challengeService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChallengePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Local state
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempting, setAttempting] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (id) {
      loadChallenge();
    }
  }, [id]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📄 ChallengePage: Loading challenge with ID:', id);
      
      const response = await challengeService.getChallenge(id);
      console.log('📄 ChallengePage: Challenge loaded:', response.data);
      
      setChallenge(response.data);
      
      // Check if we got mock data (no actual API response structure)
      if (!response.data.challenge && response.data.id) {
        setUsingMockData(true);
      }
      
    } catch (error) {
      console.error('📄 ChallengePage: Failed to load challenge:', error);
      setError('Failed to load challenge. Please try again.');
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async () => {
    try {
      setAttempting(true);
      setError(null);
      console.log('🚀 ChallengePage: Starting challenge:', id);
      
      const response = await challengeService.startChallenge(id);
      console.log('🚀 ChallengePage: Challenge started:', response.data);
      
      // Navigate to the individual challenge runner page
      navigate(`/challenges/${id}`);
    } catch (error) {
      console.error('🚀 ChallengePage: Failed to start challenge:', error);
      setError('Failed to start challenge. Please try again.');
    } finally {
      setAttempting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadChallenge();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning', 
      advanced: 'error',
      expert: 'secondary'
    };
    return colors[difficulty?.toLowerCase()] || 'default';
  };

  const getStatusInfo = (challengeData) => {
    if (challengeData?.is_completed) {
      return {
        icon: CheckCircle,
        text: 'Completed',
        color: 'success'
      };
    }
    if (challengeData?.is_unlocked !== false) {
      return {
        icon: PlayArrow,
        text: 'Available',
        color: 'primary'
      };
    }
    return {
      icon: Lock,
      text: 'Locked',
      color: 'default'
    };
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
          <CircularProgress size={60} sx={{ color: '#0cc0df' }} />
          <Typography variant="h6" color="text.secondary">
            Loading Challenge {id}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {usingMockData ? 'Using demo data' : 'Connecting to server...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state - but show mock challenge if available
  if (error && !challenge) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            }
          >
            {error}
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Running in demo mode - some features may be limited.
            </Typography>
          </Alert>
          
          {/* Fallback Challenge Interface */}
          <Card sx={{ 
            bgcolor: 'rgba(0, 8, 20, 0.9)', 
            border: '1px solid rgba(12, 192, 223, 0.3)',
            borderRadius: '16px'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ color: '#0cc0df', mb: 2 }}>
                Challenge {id}
              </Typography>
              <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 3 }}>
                Challenge details could not be loaded from the server. You can still try to start the challenge in demo mode.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleGoBack}
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
                  onClick={handleGoHome}
                  sx={{
                    background: 'linear-gradient(45deg, #0cc0df, #007acc)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #007acc, #0cc0df)'
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate(`/challenges/${id}`)}
                  sx={{
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #20c997, #28a745)'
                    }
                  }}
                >
                  Try Demo Mode
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  // No challenge found
  if (!challenge) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Challenge {id} not found or not yet available.
          </Alert>
          <Button 
            variant="outlined" 
            onClick={handleGoHome}
            startIcon={<Home />}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // Extract challenge data (handle both API and mock structure)
  const challengeData = challenge.challenge || challenge;
  const userProgress = challenge.user_progress || {};
  const statusInfo = getStatusInfo(challengeData);
  const StatusIcon = statusInfo.icon;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{ 
              mr: 2,
              color: 'rgba(168, 218, 220, 0.8)',
              '&:hover': { color: '#0cc0df' }
            }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
              {challengeData.title || challengeData.name || `Challenge ${id}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={challengeData.difficulty || 'beginner'} 
                color={getDifficultyColor(challengeData.difficulty)}
                size="small"
              />
              <Chip 
                label={(challengeData.challenge_type || challengeData.type || 'manual_movement').replace('_', ' ')} 
                variant="outlined"
                size="small"
                sx={{ color: '#0cc0df', borderColor: 'rgba(12, 192, 223, 0.5)' }}
              />
              {challengeData.estimated_time && (
                <Chip 
                  label={`${challengeData.estimated_time} min`}
                  variant="outlined"
                  size="small"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                />
              )}
              {usingMockData && (
                <Chip 
                  label="Demo Mode" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Challenge Details Card */}
            <Paper sx={{ 
              p: 4, 
              bgcolor: 'rgba(0, 8, 20, 0.9)',
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(12, 192, 223, 0.3)',
              borderRadius: '16px',
              mb: 3
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                Challenge Description
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  lineHeight: 1.7,
                  color: 'rgba(168, 218, 220, 0.9)'
                }}
              >
                {challengeData.description || 
                 'This challenge will test your robotics skills. Follow the instructions and complete the tasks to earn points.'}
              </Typography>

              {/* Instructions */}
              {challengeData.instructions && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                    Instructions
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2, 
                      lineHeight: 1.7,
                      color: 'rgba(168, 218, 220, 0.9)',
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(12, 192, 223, 0.2)'
                    }}
                  >
                    {challengeData.instructions}
                  </Typography>
                </Box>
              )}

              {/* Video URL */}
              {challengeData.video_url && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                    Instructional Video
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <iframe
                      src={challengeData.video_url}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allowFullScreen
                      title="Challenge Instructions"
                    />
                  </Box>
                </Box>
              )}

              {/* Challenge Interface */}
              <Box sx={{ 
                mt: 4, 
                p: 4, 
                bgcolor: 'rgba(12, 192, 223, 0.05)', 
                border: '1px solid rgba(12, 192, 223, 0.3)',
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <StatusIcon sx={{ fontSize: 32, color: statusInfo.color === 'primary' ? '#0cc0df' : undefined, mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Ready to Start Challenge?
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="rgba(168, 218, 220, 0.9)" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  Click the button below to start the challenge. The challenge interface will load with all the tools and controls you need to complete the tasks.
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={attempting ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                  onClick={startChallenge}
                  disabled={attempting || (challengeData.is_unlocked === false)}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    background: challengeData.is_unlocked !== false ? 
                      'linear-gradient(45deg, #0cc0df, #007acc)' : 
                      'rgba(108, 117, 125, 0.3)',
                    '&:hover': challengeData.is_unlocked !== false ? {
                      background: 'linear-gradient(45deg, #007acc, #0cc0df)',
                      boxShadow: '0 6px 20px rgba(12, 192, 223, 0.4)'
                    } : {},
                    '&:disabled': {
                      background: 'rgba(108, 117, 125, 0.3)',
                      color: 'rgba(108, 117, 125, 0.8)'
                    }
                  }}
                >
                  {attempting ? 'Starting Challenge...' : 
                   challengeData.is_completed ? 'Retry Challenge' :
                   challengeData.is_unlocked !== false ? 'Start Challenge' : 'Challenge Locked'}
                </Button>
                
                {challengeData.is_unlocked === false && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                    Complete previous challenges to unlock this one
                  </Typography>
                )}

                {usingMockData && (
                  <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="body2">
                      <strong>Demo Mode:</strong> You're viewing this challenge in demo mode. 
                      Some features may be limited until the backend server is connected.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Progress Card */}
            <Paper sx={{ 
              p: 3, 
              bgcolor: 'rgba(0, 8, 20, 0.9)',
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(12, 192, 223, 0.3)',
              borderRadius: '16px',
              mb: 3 
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                📊 Your Progress
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  icon={<StatusIcon />}
                  label={statusInfo.text}
                  color={statusInfo.color}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Best Score
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: challengeData.is_completed ? '#28a745' : '#0cc0df',
                  fontWeight: 'bold'
                }}>
                  {userProgress.best_score || challengeData.best_score || 0}%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Total Attempts
                </Typography>
                <Typography variant="h6" color="white">
                  {userProgress.total_attempts || challengeData.attempts || 0}
                </Typography>
              </Box>

              {userProgress.completion_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                    Last Completed
                  </Typography>
                  <Typography variant="body2" color="white">
                    {new Date(userProgress.completion_date).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Challenge Info */}
            <Paper sx={{ 
              p: 3, 
              bgcolor: 'rgba(0, 8, 20, 0.9)',
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(12, 192, 223, 0.3)',
              borderRadius: '16px',
              mb: 3
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                ℹ️ Challenge Info
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Estimated Time
                </Typography>
                <Typography variant="body1" color="white">
                  {challengeData.estimated_time || 30} minutes
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Difficulty Level
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize', color: 'white' }}>
                  {challengeData.difficulty || 'Beginner'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                  Challenge Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize', color: 'white' }}>
                  {(challengeData.challenge_type || challengeData.type || 'manual_movement').replace('_', ' ')}
                </Typography>
              </Box>

              {challengeData.max_score && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                    Maximum Score
                  </Typography>
                  <Typography variant="body1" color="white">
                    {challengeData.max_score} points
                  </Typography>
                </Box>
              )}

              {challengeData.parameters && Object.keys(challengeData.parameters).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="rgba(168, 218, 220, 0.8)" gutterBottom>
                    Parameters
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 1,
                    border: '1px solid rgba(12, 192, 223, 0.2)'
                  }}>
                    {Object.entries(challengeData.parameters).map(([key, value]) => (
                      <Typography key={key} variant="caption" display="block" color="rgba(168, 218, 220, 0.9)">
                        <strong>{key.replace('_', ' ')}:</strong> {JSON.stringify(value)}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ 
              p: 3, 
              bgcolor: 'rgba(0, 8, 20, 0.9)',
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(12, 192, 223, 0.3)',
              borderRadius: '16px'
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffd60a', fontWeight: 'bold' }}>
                🎯 Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  fullWidth
                  sx={{ 
                    borderColor: 'rgba(12, 192, 223, 0.5)',
                    color: '#0cc0df',
                    '&:hover': {
                      borderColor: '#0cc0df',
                      bgcolor: 'rgba(12, 192, 223, 0.1)'
                    }
                  }}
                >
                  Dashboard
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRetry}
                  fullWidth
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Reload Challenge
                </Button>

                {challengeData.video_url && (
                  <Button
                    variant="outlined"
                    startIcon={<Info />}
                    onClick={() => window.open(challengeData.video_url, '_blank')}
                    fullWidth
                    sx={{ 
                      borderColor: 'rgba(255, 193, 7, 0.5)',
                      color: '#ffc107',
                      '&:hover': {
                        borderColor: '#ffc107',
                        bgcolor: 'rgba(255, 193, 7, 0.1)'
                      }
                    }}
                  >
                    Watch Tutorial
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <Paper sx={{ 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1,
                mt: 2 
              }}>
                <Typography variant="caption" gutterBottom display="block" sx={{ color: '#ffc107' }}>
                  🔍 Debug Info (Dev Mode):
                </Typography>
                <Typography variant="caption" component="pre" sx={{ 
                  fontSize: '9px', 
                  overflow: 'auto',
                  color: 'rgba(255, 255, 255, 0.7)',
                  wordBreak: 'break-all'
                }}>
                  ID: {id}{'\n'}
                  Mock: {usingMockData ? 'Yes' : 'No'}{'\n'}
                  Data: {JSON.stringify(challenge, null, 1).substring(0, 200)}...
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ChallengePage;