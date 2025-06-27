// =================== DashboardLayout.jsx ===================
import React from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  DashboardStats,
  QuickActions,
  RecentActivity,
  ChallengeGrid,
  ProgressTracker,
  RobotStatus,
  Achievements
} from './';

const DashboardLayout = () => {
  const { user } = useSelector(state => state.auth);
  const { challenges, userProgress, loading } = useSelector(state => state.challenges);
  const { connected: robotConnected } = useSelector(state => state.robot);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 8 }}>
          <LoadingSpinner message="Loading your dashboard..." />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome back, {user?.username || 'Student'}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Continue your robotics learning journey
          </Typography>
        </Box>

        {/* Dashboard Stats - Full width */}
        <DashboardStats />

        {/* Quick Actions - Full width */}
        <QuickActions />

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Challenge Grid */}
            <ChallengeGrid maxChallenges={6} showFilters={true} />
            
            {/* Recent Activity */}
            <RecentActivity maxItems={8} />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Robot Status */}
            <Box sx={{ mb: 4 }}>
              <RobotStatus compact={false} />
            </Box>
            
            {/* Progress Tracker */}
            <Box sx={{ mb: 4 }}>
              <ProgressTracker />
            </Box>
            
            {/* Achievements */}
            <Achievements maxAchievements={6} />
          </Grid>
        </Grid>

        {/* Additional System Info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.disabled">
              Development Info: Robot Connected: {robotConnected ? '✅' : '❌'} | 
              Challenges Loaded: {challenges?.length || 0} | 
              Total Score: {userProgress?.totalScore || 0}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DashboardLayout;