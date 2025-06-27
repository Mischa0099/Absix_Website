import React, { useState, useEffect } from 'react';
import { GpsFixed as Target } from '@mui/icons-material';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Refresh, 
  Timer, 
  Speed,
  CheckCircle,
  RadioButtonUnchecked,
  Warning,
  TrendingUp,
  Assessment,
  EmojiEvents,
  School
} from '@mui/icons-material';

const ChallengeProgressPanel = ({
  challengeState,
  onStart,
  onReset,
  isConnected,
  isExecuting
}) => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Challenge objectives/steps
  const challengeSteps = [
    {
      label: 'Connect Robot Hardware',
      description: 'Establish connection with the robot system',
      completed: isConnected,
      icon: '🔌'
    },
    {
      label: 'Write Control Code',
      description: 'Implement Python code to move joints to target position',
      completed: challengeState.attempts > 0,
      icon: '💻'
    },
    {
      label: 'Execute Movement',
      description: 'Run your code and observe robot movement',
      completed: challengeState.attempts > 0,
      icon: '🚀'
    },
    {
      label: 'Achieve Target Position',
      description: 'Reach [30°, 0°, 0°] with error < 5°',
      completed: challengeState.isCompleted,
      icon: '🎯'
    }
  ];

  // Update active step based on progress
  useEffect(() => {
    const completedSteps = challengeSteps.findIndex(step => !step.completed);
    setActiveStep(completedSteps === -1 ? challengeSteps.length : completedSteps);
  }, [isConnected, challengeState.attempts, challengeState.isCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getAccuracyLevel = (accuracy) => {
    if (accuracy >= 95) return { level: 'Excellent', color: '#22c55e', icon: '🏆' };
    if (accuracy >= 85) return { level: 'Good', color: '#3b82f6', icon: '👍' };
    if (accuracy >= 70) return { level: 'Fair', color: '#f59e0b', icon: '⚠️' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: '📈' };
  };

  const accuracyInfo = getAccuracyLevel(challengeState.accuracy);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main Progress Panel */}
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            Challenge Progress
          </Typography>
          
          <Box display="flex" gap={2}>
            {!challengeState.isStarted ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={onStart}
                disabled={!isConnected || isExecuting}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  px: 3
                }}
              >
                Start Challenge
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onReset}
                disabled={isExecuting}
                color="secondary"
              >
                Reset Challenge
              </Button>
            )}
          </Box>
        </Box>

        {/* Progress Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Score Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {challengeState.score}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Score / 100
                </Typography>
                {challengeState.bestScore > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Best: {challengeState.bestScore}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Accuracy Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Target color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: accuracyInfo.color }}>
                  {challengeState.accuracy.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position Accuracy
                </Typography>
                <Chip 
                  label={`${accuracyInfo.icon} ${accuracyInfo.level}`}
                  size="small"
                  sx={{ 
                    mt: 0.5,
                    bgcolor: accuracyInfo.color,
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Attempts Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {challengeState.attempts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attempts
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(challengeState.attempts * 25, 100)}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Time Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Timer color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatTime(challengeState.timeElapsed)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Elapsed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: Under 5:00
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Current Error Display */}
        {challengeState.isStarted && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={challengeState.currentError < 5 ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                <strong>Current Position Error: {challengeState.currentError.toFixed(2)}°</strong>
                {challengeState.currentError < 5 
                  ? ' - Excellent! Target reached within tolerance.' 
                  : ` - Target: <5°. Adjust your code for better precision.`
                }
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Challenge Steps */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <School color="primary" />
          Challenge Objectives
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {challengeSteps.map((step, index) => (
            <Step key={index} completed={step.completed}>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: step.completed ? 'success.main' : 'grey.300',
                    color: step.completed ? 'white' : 'grey.600',
                    fontSize: '14px'
                  }}>
                    {step.completed ? <CheckCircle fontSize="small" /> : step.icon}
                  </Box>
                )}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {/* Step-specific content */}
                {index === 0 && !isConnected && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Click "Connect Robot" in the control panel to establish hardware connection.
                  </Alert>
                )}
                
                {index === 1 && isConnected && challengeState.attempts === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Write Python code in the editor to move joints to target position [30°, 0°, 0°].
                  </Alert>
                )}
                
                {index === 2 && challengeState.attempts > 0 && !challengeState.isCompleted && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Position error: {challengeState.currentError.toFixed(2)}°. 
                    Adjust your code for better accuracy.
                  </Alert>
                )}
                
                {index === 3 && challengeState.isCompleted && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    🎉 Congratulations! Challenge completed successfully!
                  </Alert>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Completion Status */}
        {challengeState.isCompleted && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 'bold', mb: 1 }}>
              🏆 Challenge Completed!
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'success.dark' }}>
                  <strong>Final Score:</strong> {challengeState.score}/100
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.dark' }}>
                  <strong>Accuracy:</strong> {challengeState.accuracy.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'success.dark' }}>
                  <strong>Time:</strong> {formatTime(challengeState.timeElapsed)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.dark' }}>
                  <strong>Attempts:</strong> {challengeState.attempts}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Learning Tips */}
        {!challengeState.isCompleted && challengeState.isStarted && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'info.dark', fontWeight: 'bold', mb: 1 }}>
              💡 Tips for Success:
            </Typography>
            <Box component="ul" sx={{ margin: 0, paddingLeft: 2, color: 'info.dark' }}>
              <Typography component="li" variant="body2">
                Use <code>robot.move_joint(joint_id, angle)</code> to move individual joints
              </Typography>
              <Typography component="li" variant="body2">
                Add small delays with <code>time.sleep(0.5)</code> between movements
              </Typography>
              <Typography component="li" variant="body2">
                Check your position with <code>robot.get_position()</code>
              </Typography>
              <Typography component="li" variant="body2">
                Target position is [30°, 0°, 0°] with tolerance of ±5°
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChallengeProgressPanel;