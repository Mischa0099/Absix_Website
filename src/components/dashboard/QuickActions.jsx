// =================== QuickActions.jsx ===================
import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PlayArrow, 
  Assessment, 
  School, 
  Settings,
  Help,
  Download,
  Refresh,
  Science
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChallenges } from '../../store/challengeSlice';
import { useNotification } from '../common/Notification';

const ActionCard = ({ icon, title, description, onClick, color = 'primary', disabled = false }) => (
  <Paper 
    sx={{ 
      p: 3, 
      height: '100%',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s ease',
      '&:hover': !disabled ? {
        transform: 'translateY(-2px)',
        boxShadow: 4
      } : {},
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}
    onClick={disabled ? undefined : onClick}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Box 
        sx={{ 
          bgcolor: `${color}.main`, 
          borderRadius: '50%', 
          p: 2, 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 32, color: 'white' } })}
      </Box>
      
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Paper>
);

const QuickActions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { challenges } = useSelector(state => state.challenges);
  const { connected: robotConnected } = useSelector(state => state.robot);
  
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Find next available challenge
  const nextChallenge = challenges?.find(c => !c.is_completed && c.is_unlocked);
  
  const handleStartNext = () => {
    if (nextChallenge) {
      navigate(`/challenge/${nextChallenge.id}`);
    } else {
      showNotification('No new challenges available at the moment', 'info');
    }
  };

  const handleViewProgress = () => {
    navigate('/dashboard#progress');
    // Scroll to progress section
    setTimeout(() => {
      const progressSection = document.getElementById('progress-section');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleRobotCalibration = () => {
    if (!robotConnected) {
      showNotification('Please connect to the robot first', 'warning');
      return;
    }
    navigate('/robot/calibration');
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchChallenges());
      showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      showNotification('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadProgress = () => {
    // Generate and download progress report
    const progressData = {
      user: challenges?.[0]?.user_id || 'anonymous',
      timestamp: new Date().toISOString(),
      challenges: challenges?.length || 0,
      completed: challenges?.filter(c => c.is_completed)?.length || 0,
      totalScore: challenges?.reduce((sum, c) => sum + (c.best_score || 0), 0) || 0
    };
    
    const dataStr = JSON.stringify(progressData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-rising-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showNotification('Progress report downloaded', 'success');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🚀 Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        {/* Start Next Challenge */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<PlayArrow />}
            title="Continue Learning"
            description={nextChallenge ? `Start "${nextChallenge.title}"` : "All challenges completed!"}
            onClick={handleStartNext}
            color="success"
            disabled={!nextChallenge}
          />
        </Grid>

        {/* View Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Assessment />}
            title="View Progress"
            description="Track your learning journey and achievements"
            onClick={handleViewProgress}
            color="primary"
          />
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<School />}
            title="Leaderboard"
            description="See how you rank against other students"
            onClick={handleViewLeaderboard}
            color="info"
          />
        </Grid>

        {/* Robot Calibration */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Science />}
            title="Robot Controls"
            description="Calibrate and test robot hardware"
            onClick={handleRobotCalibration}
            color="warning"
            disabled={!robotConnected}
          />
        </Grid>

        {/* Help & Tutorial */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Help />}
            title="Help & Tutorial"
            description="Learn how to use the platform effectively"
            onClick={() => setHelpDialogOpen(true)}
            color="secondary"
          />
        </Grid>

        {/* Refresh Data */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Refresh />}
            title="Refresh Data"
            description="Update challenges and progress information"
            onClick={handleRefreshData}
            color="primary"
            disabled={refreshing}
          />
        </Grid>

        {/* Download Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Download />}
            title="Export Progress"
            description="Download your learning progress report"
            onClick={handleDownloadProgress}
            color="info"
          />
        </Grid>

        {/* Settings */}
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<Settings />}
            title="Settings"
            description="Customize your learning experience"
            onClick={() => navigate('/settings')}
            color="default"
          />
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Getting Started with Aurora Rising</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to Aurora Rising! Here's how to make the most of your robotics learning experience:
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            📚 Challenges
          </Typography>
          <Typography variant="body2" paragraph>
            Complete challenges in order to unlock new content. Each challenge builds on previous concepts.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            🤖 Robot Control
          </Typography>
          <Typography variant="body2" paragraph>
            Connect to real hardware to practice robot control. Make sure the robot is powered on and connected.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            📈 Progress Tracking
          </Typography>
          <Typography variant="body2" paragraph>
            Monitor your learning progress, earn ranks, and compete with other students on the leaderboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Got it!</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickActions;