// =================== CompactDashboard.jsx ===================
import React from 'react';
import { Container, Grid, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  DashboardStats,
  QuickActions,
  ChallengeGrid,
  RobotStatus
} from './';

// Compact version for mobile or embedded use
const CompactDashboard = () => {
  const { challenges } = useSelector(state => state.challenges);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 2 }}>
        <Grid container spacing={2}>
          {/* Compact Stats */}
          <Grid item xs={12}>
            <DashboardStats />
          </Grid>

          {/* Robot Status - Compact */}
          <Grid item xs={12} md={6}>
            <RobotStatus compact={true} />
          </Grid>

          {/* Quick Start Challenge */}
          <Grid item xs={12} md={6}>
            <QuickActions />
          </Grid>

          {/* Recent Challenges */}
          <Grid item xs={12}>
            <ChallengeGrid maxChallenges={3} showFilters={false} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CompactDashboard;