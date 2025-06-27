// =================== DashboardStats.jsx ===================
import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Avatar,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  EmojiEvents, 
  Assignment, 
  Speed,
  School,
  Timer
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getRank, getScoreColor, formatDuration } from '../../utils/helpers';

const StatCard = ({ icon, title, value, subtitle, color = 'primary', progress = null }) => (
  <Paper 
    sx={{ 
      p: 3, 
      height: '100%', 
      background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar 
        sx={{ 
          bgcolor: `${color}.main`, 
          mr: 2,
          width: 48,
          height: 48
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
    
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    
    {progress !== null && (
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 6, 
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            bgcolor: `${color}.main`
          }
        }}
      />
    )}
  </Paper>
);

const DashboardStats = () => {
  const { user } = useSelector(state => state.auth);
  const { challenges, userProgress } = useSelector(state => state.challenges);
  
  // Calculate statistics
  const totalChallenges = challenges?.length || 0;
  const completedChallenges = challenges?.filter(c => c.is_completed) || [];
  const completionRate = totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0;
  const totalScore = userProgress?.totalScore || 0;
  const averageScore = completedChallenges.length > 0 
    ? Math.round(totalScore / completedChallenges.length) 
    : 0;
  const currentRank = getRank(completedChallenges.length, totalScore);
  const totalTimeSpent = userProgress?.totalTimeSpent || 0;
  const streak = userProgress?.currentStreak || 0;
  
  // Calculate progress to next rank
  const rankThresholds = [
    { rank: 'Robotics Beginner', challenges: 2, score: 150 },
    { rank: 'Robotics Specialist', challenges: 5, score: 400 },
    { rank: 'Robotics Expert', challenges: 8, score: 700 },
    { rank: 'Robotics Master', challenges: 12, score: 1000 }
  ];
  
  const nextRankThreshold = rankThresholds.find(
    t => completedChallenges.length < t.challenges || totalScore < t.score
  );
  
  const rankProgress = nextRankThreshold 
    ? Math.min(
        (completedChallenges.length / nextRankThreshold.challenges) * 100,
        (totalScore / nextRankThreshold.score) * 100
      )
    : 100;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 Your Statistics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Challenges Completed */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assignment />}
            title="Challenges Completed"
            value={completedChallenges.length}
            subtitle={`${completionRate.toFixed(0)}% completion rate`}
            color="success"
            progress={completionRate}
          />
        </Grid>

        {/* Total Score */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EmojiEvents />}
            title="Total Score"
            value={totalScore}
            subtitle={`Avg: ${averageScore} pts`}
            color={getScoreColor(averageScore) === '#4CAF50' ? 'success' : 
                   getScoreColor(averageScore) === '#FF9800' ? 'warning' : 'error'}
          />
        </Grid>

        {/* Current Rank */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Current Rank"
            value={
              <Chip 
                label={currentRank} 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              />
            }
            subtitle={nextRankThreshold ? `${rankProgress.toFixed(0)}% to ${nextRankThreshold.rank}` : 'Max rank achieved!'}
            color="primary"
            progress={rankProgress}
          />
        </Grid>

        {/* Learning Time */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Timer />}
            title="Time Spent Learning"
            value={formatDuration(totalTimeSpent)}
            subtitle={`${streak} day streak`}
            color="info"
          />
        </Grid>

        {/* Average Performance by Difficulty */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Performance by Difficulty Level
            </Typography>
            
            <Grid container spacing={2}>
              {['beginner', 'intermediate', 'advanced', 'expert'].map((difficulty) => {
                const difficultyChallenges = challenges?.filter(c => c.difficulty === difficulty) || [];
                const difficultyCompleted = difficultyChallenges.filter(c => c.is_completed);
                const difficultyAvgScore = difficultyCompleted.length > 0
                  ? Math.round(difficultyCompleted.reduce((sum, c) => sum + (c.best_score || 0), 0) / difficultyCompleted.length)
                  : 0;
                const difficultyProgress = difficultyChallenges.length > 0 
                  ? (difficultyCompleted.length / difficultyChallenges.length) * 100 
                  : 0;

                const difficultyColors = {
                  beginner: '#4CAF50',
                  intermediate: '#FF9800', 
                  advanced: '#F44336',
                  expert: '#9C27B0'
                };

                return (
                  <Grid item xs={12} sm={6} md={3} key={difficulty}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        sx={{ color: difficultyColors[difficulty] }}
                      >
                        {difficultyCompleted.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenges
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg Score: {difficultyAvgScore}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={difficultyProgress}
                        sx={{ 
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: difficultyColors[difficulty]
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;
