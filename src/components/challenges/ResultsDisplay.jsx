// src/components/challenges/ResultsDisplay.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Star,
  Timer,
  TrendingUp,
  Replay
} from '@mui/icons-material';
import { getScoreColor, getRank } from '../../utils/helpers';

const ResultsDisplay = ({ result, challenge, onRetry }) => {
  const {
    score = 0,
    success = false,
    feedback = '',
    timeElapsed = 0,
    accuracy = 0,
    attempts = 1,
    details = {}
  } = result;

  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A+', color: '#4CAF50' };
    if (score >= 80) return { letter: 'A', color: '#4CAF50' };
    if (score >= 70) return { letter: 'B', color: '#8BC34A' };
    if (score >= 60) return { letter: 'C', color: '#FF9800' };
    if (score >= 50) return { letter: 'D', color: '#FF5722' };
    return { letter: 'F', color: '#F44336' };
  };

  const grade = getGrade(score);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom className="text-center">
        🏆 Challenge Results
      </Typography>

      {/* Overall Result */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
            {success ? (
              <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
            ) : (
              <Cancel sx={{ fontSize: 48, color: 'error.main' }} />
            )}
            
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: grade.color }}>
              {grade.letter}
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            {success ? 'Challenge Completed!' : 'Challenge Failed'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {feedback || (success ? 'Great job! You successfully completed the challenge.' : 'Keep practicing and try again!')}
          </Typography>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 32, color: getScoreColor(score), mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: getScoreColor(score) }}>
                {score}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Final Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {formatTime(timeElapsed)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Time Taken
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {accuracy || score}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Accuracy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Replay sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {attempts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Breakdown */}
      {details && Object.keys(details).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Breakdown
            </Typography>
            
            {Object.entries(details).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {typeof value === 'number' ? `${value}%` : value}
                  </Typography>
                </Box>
                
                {typeof value === 'number' && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(value, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(value)
                      }
                    }}
                  />
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Achievement/Rank */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Achievement Unlocked
          </Typography>
          
          <Chip
            label={getRank(1, score)} // This would normally use actual progress
            color="primary"
            sx={{ fontSize: '1rem', p: 2, mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            {score >= 80 
              ? "Excellent work! You've mastered this challenge." 
              : score >= 60 
              ? "Good job! You're making progress." 
              : "Keep practicing to improve your skills!"
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Replay />}
          onClick={onRetry}
          sx={{ mr: 2 }}
        >
          Try Again
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => window.history.back()}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Paper>
  );
};

export default ResultsDisplay;