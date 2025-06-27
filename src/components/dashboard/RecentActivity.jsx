// =================== RecentActivity.jsx ===================
import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  Schedule, 
  Assignment, 
  EmojiEvents,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ icon, primary, secondary, timestamp, color = 'primary', score = null }) => (
  <>
    <ListItem>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">{primary}</Typography>
            {score && (
              <Chip 
                label={`${score} pts`} 
                size="small" 
                color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
  </>
);

const RecentActivity = ({ maxItems = 10 }) => {
  const { challenges, userProgress } = useSelector(state => state.challenges);
  
  // Generate recent activity data
  const generateRecentActivity = () => {
    const activities = [];
    
    // Add completed challenges
    challenges?.forEach(challenge => {
      if (challenge.is_completed && challenge.completion_date) {
        activities.push({
          id: `challenge-${challenge.id}`,
          type: 'challenge_completed',
          icon: <CheckCircle />,
          primary: `Completed "${challenge.title}"`,
          secondary: challenge.description,
          timestamp: challenge.completion_date,
          color: 'success',
          score: challenge.best_score
        });
      }
    });
    
    // Add achievements (mock data - replace with real achievements)
    const mockAchievements = [
      {
        id: 'first-complete',
        title: 'First Steps',
        description: 'Completed your first challenge',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        unlocked: true
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Completed a challenge in under 5 minutes',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        unlocked: userProgress?.fastestCompletion < 300
      }
    ];
    
    mockAchievements.forEach(achievement => {
      if (achievement.unlocked) {
        activities.push({
          id: `achievement-${achievement.id}`,
          type: 'achievement_unlocked',
          icon: <EmojiEvents />,
          primary: `Achievement Unlocked: ${achievement.title}`,
          secondary: achievement.description,
          timestamp: achievement.timestamp,
          color: 'warning'
        });
      }
    });
    
    // Add rank ups (mock data)
    if (userProgress?.rankHistory?.length > 0) {
      userProgress.rankHistory.forEach((rankChange, index) => {
        activities.push({
          id: `rank-${index}`,
          type: 'rank_up',
          icon: <TrendingUp />,
          primary: `Rank Advanced: ${rankChange.newRank}`,
          secondary: `Congratulations on reaching a new rank!`,
          timestamp: rankChange.timestamp,
          color: 'primary'
        });
      });
    }
    
    // Add recent attempts (mock data)
    const recentAttempts = challenges?.filter(c => c.last_attempt && !c.is_completed) || [];
    recentAttempts.forEach(challenge => {
      activities.push({
        id: `attempt-${challenge.id}`,
        type: 'challenge_attempted',
        icon: <Schedule />,
        primary: `Attempted "${challenge.title}"`,
        secondary: 'Keep trying! You\'re making progress.',
        timestamp: challenge.last_attempt,
        color: 'info'
      });
    });
    
    // Sort by timestamp (most recent first) and limit
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxItems);
  };
  
  const activities = generateRecentActivity();

  if (activities.length === 0) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          📋 Recent Activity
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No recent activity yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Start completing challenges to see your progress here!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          📋 Recent Activity
        </Typography>
      </Box>
      
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            icon={activity.icon}
            primary={activity.primary}
            secondary={activity.secondary}
            timestamp={activity.timestamp}
            color={activity.color}
            score={activity.score}
          />
        ))}
      </List>
      
      {activities.length === maxItems && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            Showing {maxItems} most recent activities
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecentActivity;