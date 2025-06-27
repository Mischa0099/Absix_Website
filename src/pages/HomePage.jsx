// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  School, 
  Psychology, 
  Engineering, 
  TrendingUp,
  PlayArrow,
  Leaderboard
} from '@mui/icons-material';
import { fetchChallenges } from '../store/challengeSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoginForm from '../components/auth/LoginForm';
import ChallengeMap from '../components/challenges/ChallengeMap';
import { getRank, calculateProgress } from '../utils/helpers';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading: authLoading } = useSelector(state => state.auth);
  const { challenges, userProgress, loading: challengesLoading } = useSelector(state => state.challenges);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChallenges());
    }
  }, [isAuthenticated, dispatch]);

  if (authLoading) {
    return (
      <Box className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner message="Loading..." />
      </Box>
    );
  }

  // Show login form for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          {/* Hero Section */}
          <Box className="text-center" sx={{ mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Aurora Rising
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom color="primary">
              Robotics Summer School
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: 800, mx: 'auto', color: 'text.secondary' }}>
              Master robot kinematics through interactive challenges with real hardware control.
              Learn robotics fundamentals, control theory, and advanced manipulation techniques.
            </Typography>

            {/* Feature Cards */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Interactive Learning
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Learn through hands-on challenges with real robot hardware
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Control Theory
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Master PD control, kinematics, and advanced robotics concepts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Engineering sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Real Hardware
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Control actual robot arms and see immediate results
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Login Form */}
          <LoginForm />
        </Box>
      </Container>
    );
  }

  // Show loading while fetching challenges
  if (challengesLoading) {
    return (
      <Box className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner message="Loading challenges..." />
      </Box>
    );
  }

  // Dashboard view for authenticated users
  const completedChallenges = challenges?.filter(c => c.is_completed) || [];
  const progressPercentage = calculateProgress(completedChallenges.length, challenges?.length || 0);
  const userRank = getRank(completedChallenges.length, userProgress?.totalScore || 0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Welcome Header */}
        <Box className="text-center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome Back, {userRank}!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Continue your robotics journey with {user?.username}
          </Typography>
          
          <Chip
            label={`Progress: ${progressPercentage}%`}
            color="primary"
            sx={{ mt: 2, fontSize: '1rem', p: 2 }}
          />
        </Box>

        {/* Progress Overview */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {completedChallenges.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Challenges Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {userProgress?.totalScore || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Psychology sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {userProgress?.averageScore || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Engineering sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  {userRank}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Rank
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Card sx={{ mb: 6, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Overall Progress
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {completedChallenges.length} / {challenges?.length || 0} challenges
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                height: 12, 
                borderRadius: 6,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6
                }
              }} 
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <PlayArrow sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Continue Learning
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Jump back into challenges and improve your robotics skills.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  fullWidth
                >
                  View All Challenges
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Leaderboard sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  View Rankings
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  See how you rank against other students in the program.
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/leaderboard')}
                  fullWidth
                >
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Featured Challenges */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom className="text-center">
            Available Challenges
          </Typography>
          <Typography variant="body1" color="text.secondary" className="text-center" sx={{ mb: 4 }}>
            Start with beginner challenges and work your way up to advanced robotics concepts
          </Typography>
          
          <ChallengeMap challenges={challenges} />
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
