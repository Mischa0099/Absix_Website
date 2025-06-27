// =================== Achievements.jsx ===================
import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  EmojiEvents, 
  Speed, 
  School,
  Star,
  Timeline,
  Lock,
  CheckCircle
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const AchievementCard = ({ achievement, unlocked, progress = null }) => (
  <Card 
    sx={{ 
      height: '100%',
      opacity: unlocked ? 1 : 0.6,
      background: unlocked 
        ? 'linear-gradient(145deg, #2d5a41, #1b4332)' 
        : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
      border: '1px solid',
      borderColor: unlocked ? 'success.main' : 'divider'
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: unlocked ? 'success.main' : 'grey.700',
            mr: 2,
            width: 40,
            height: 40
          }}
        >
          {unlocked ? <CheckCircle /> : <Lock />}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {achievement.title}
          </Typography>
          <Chip 
            label={achievement.category} 
            size="small" 
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {achievement.description}
      </Typography>
      
      {progress !== null && !unlocked && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Progress: {Math.round(progress)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ 
              height: 4, 
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2
              }
            }}
          />
        </Box>
      )}
      
      {unlocked && achievement.unlockedDate && (
        <Typography variant="caption" color="success.main">
          Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Achievements = ({ maxAchievements = 6 }) => {
  const { challenges, userProgress } = useSelector(state => state.challenges);
  
  const completedChallenges = challenges?.filter(c => c.is_completed) || [];
  const totalScore = userProgress?.totalScore || 0;
  const fastestCompletion = userProgress?.fastestCompletion || Infinity;
  const currentStreak = userProgress?.currentStreak || 0;
  
  // Define achievements with unlock conditions
  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first robotics challenge',
      category: 'Progress',
      icon: <School />,
      unlockCondition: () => completedChallenges.length >= 1,
      progress: () => completedChallenges.length >= 1 ? 100 : 0
    },
    {
      id: 'perfect-score',
      title: 'Perfect Execution',
      description: 'Achieve a perfect score of 100 on any challenge',
      category: 'Excellence',
      icon: <Star />,
      unlockCondition: () => completedChallenges.some(c => (c.best_score || 0) >= 100),
      progress: () => {
        const highestScore = Math.max(...completedChallenges.map(c => c.best_score || 0), 0);
        return Math.min(100, highestScore);
      }
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Complete a challenge in under 5 minutes',
      category: 'Speed',
      icon: <Speed />,
      unlockCondition: () => fastestCompletion < 300, // 5 minutes
      progress: () => fastestCompletion < Infinity ? Math.max(0, 100 - (fastestCompletion / 300) * 100) : 0
    },
    {
      id: 'dedicated-learner',
      title: 'Dedicated Learner',
      description: 'Complete challenges for 7 days in a row',
      category: 'Consistency',
      icon: <Timeline />,
      unlockCondition: () => currentStreak >= 7,
      progress: () => Math.min(100, (currentStreak / 7) * 100)
    },
    {
      id: 'robotics-specialist',
      title: 'Robotics Specialist',
      description: 'Complete 5 challenges with an average score above 80',
      category: 'Mastery',
      icon: <EmojiEvents />,
      unlockCondition: () => {
        if (completedChallenges.length < 5) return false;
        const avgScore = totalScore / completedChallenges.length;
        return avgScore >= 80;
      },
      progress: () => {
        if (completedChallenges.length < 5) {
          return (completedChallenges.length / 5) * 50; // 50% for completing 5 challenges
        }
        const avgScore = totalScore / completedChallenges.length;
        return 50 + Math.min(50, ((avgScore - 80) / 20) * 50); // Additional 50% for score above 80
      }
    },
    {
      id: 'challenge-master',
      title: 'Challenge Master',
      description: 'Complete all available challenges',
      category: 'Completion',
      icon: <EmojiEvents />,
      unlockCondition: () => {
        const totalChallenges = challenges?.length || 0;
        return totalChallenges > 0 && completedChallenges.length === totalChallenges;
      },
      progress: () => {
        const totalChallenges = challenges?.length || 0;
        if (totalChallenges === 0) return 0;
        return (completedChallenges.length / totalChallenges) * 100;
      }
    }
  ];
  
  // Calculate which achievements are unlocked
  const processedAchievements = achievements.map(achievement => ({
    ...achievement,
    unlocked: achievement.unlockCondition(),
    progress: achievement.progress(),
    unlockedDate: achievement.unlockCondition() ? new Date().toISOString() : null
  }));
  
  // Sort: unlocked first, then by progress
  const sortedAchievements = processedAchievements
    .sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return b.progress - a.progress;
    })
    .slice(0, maxAchievements);
  
  const unlockedCount = processedAchievements.filter(a => a.unlocked).length;

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents color="warning" />
          Achievements
        </Typography>
        
        <Chip
          label={`${unlockedCount}/${achievements.length} Unlocked`}
          color={unlockedCount === achievements.length ? 'success' : 'primary'}
          variant="outlined"
        />
      </Box>
      
      <Grid container spacing={2}>
        {sortedAchievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <AchievementCard 
              achievement={achievement}
              unlocked={achievement.unlocked}
              progress={achievement.unlocked ? null : achievement.progress}
            />
          </Grid>
        ))}
      </Grid>
      
      {processedAchievements.length > maxAchievements && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {maxAchievements} of {achievements.length} achievements
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default Achievements;