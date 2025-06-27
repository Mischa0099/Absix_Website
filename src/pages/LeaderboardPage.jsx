// src/pages/LeaderboardPage.jsx
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Avatar, 
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  EmojiEvents,
  TrendingUp,
  School,
  Timer,
  Refresh
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLeaderboard } from '../store/challengeSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRank, getScoreColor } from '../utils/helpers';

const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const { leaderboard, loading } = useSelector(state => state.challenges);
  const { user } = useSelector(state => state.auth);
  
  const [sortBy, setSortBy] = useState('total_score'); // 'total_score', 'challenges_completed', 'average_score'

  useEffect(() => {
    dispatch(fetchLeaderboard(100));
  }, [dispatch]);

  const handleSortChange = (event, newSortBy) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchLeaderboard(100));
  };

  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...(leaderboard || [])].sort((a, b) => {
    switch (sortBy) {
      case 'challenges_completed':
        return (b.challenges_completed || 0) - (a.challenges_completed || 0);
      case 'average_score':
        const avgA = a.challenges_completed > 0 ? (a.total_score || 0) / a.challenges_completed : 0;
        const avgB = b.challenges_completed > 0 ? (b.total_score || 0) / b.challenges_completed : 0;
        return avgB - avgA;
      case 'total_score':
      default:
        return (b.total_score || 0) - (a.total_score || 0);
    }
  });

  // Calculate stats
  const topPerformers = sortedLeaderboard.slice(0, 3);
  const currentUserRank = sortedLeaderboard.findIndex(entry => entry.username === user?.username) + 1;
  const currentUserEntry = sortedLeaderboard.find(entry => entry.username === user?.username);

  if (loading) {
    return (
      <Box className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner message="Loading leaderboard..." />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box className="text-center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🏆 Leaderboard
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            See how you rank against other robotics students
          </Typography>
          
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Refresh Rankings
          </Button>
        </Box>

        {/* Top Performers */}
        {topPerformers.length >= 3 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom className="text-center">
              🥇 Top Performers
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              {/* 2nd Place */}
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', textAlign: 'center', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" color="text.secondary">🥈</Typography>
                    </Box>
                    <Avatar
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: '#C0C0C0',
                        fontSize: '2rem'
                      }}
                    >
                      {topPerformers[1]?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {topPerformers[1]?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getRank(topPerformers[1]?.challenges_completed || 0, topPerformers[1]?.total_score || 0)}
                    </Typography>
                    <Typography variant="h5" sx={{ color: getScoreColor(topPerformers[1]?.total_score || 0), fontWeight: 'bold' }}>
                      {topPerformers[1]?.total_score || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 1st Place */}
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', textAlign: 'center', height: '100%', transform: 'scale(1.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" color="warning.main">👑</Typography>
                    </Box>
                    <Avatar
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: '#FFD700',
                        fontSize: '2.5rem',
                        color: 'black'
                      }}
                    >
                      {topPerformers[0]?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {topPerformers[0]?.username}
                    </Typography>
                    <Typography variant="body1" color="warning.main" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {getRank(topPerformers[0]?.challenges_completed || 0, topPerformers[0]?.total_score || 0)}
                    </Typography>
                    <Typography variant="h4" sx={{ color: getScoreColor(topPerformers[0]?.total_score || 0), fontWeight: 'bold' }}>
                      {topPerformers[0]?.total_score || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 3rd Place */}
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', textAlign: 'center', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" color="text.secondary">🥉</Typography>
                    </Box>
                    <Avatar
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: '#CD7F32',
                        fontSize: '2rem'
                      }}
                    >
                      {topPerformers[2]?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {topPerformers[2]?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getRank(topPerformers[2]?.challenges_completed || 0, topPerformers[2]?.total_score || 0)}
                    </Typography>
                    <Typography variant="h5" sx={{ color: getScoreColor(topPerformers[2]?.total_score || 0), fontWeight: 'bold' }}>
                      {topPerformers[2]?.total_score || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Your Rank */}
        {currentUserEntry && (
          <Card sx={{ mb: 4, bgcolor: 'rgba(12, 192, 223, 0.1)', border: '1px solid #0cc0df' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Your Current Standing
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    #{currentUserRank}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Rank
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: getScoreColor(currentUserEntry.total_score || 0) }}>
                          {currentUserEntry.total_score || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Score
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {currentUserEntry.challenges_completed || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {currentUserEntry.challenges_completed > 0 
                            ? Math.round((currentUserEntry.total_score || 0) / currentUserEntry.challenges_completed)
                            : 0
                          }%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Average
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                          {getRank(currentUserEntry.challenges_completed || 0, currentUserEntry.total_score || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Title
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Sort Options */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            aria-label="sort criteria"
          >
            <ToggleButton value="total_score" aria-label="total score">
              <EmojiEvents sx={{ mr: 1 }} />
              Total Score
            </ToggleButton>
            <ToggleButton value="challenges_completed" aria-label="challenges completed">
              <School sx={{ mr: 1 }} />
              Challenges
            </ToggleButton>
            <ToggleButton value="average_score" aria-label="average score">
              <TrendingUp sx={{ mr: 1 }} />
              Average
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Leaderboard Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Challenges Completed</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Average Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedLeaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.username === user.username;
                const averageScore = entry.challenges_completed > 0 ? 
                  Math.round((entry.total_score || 0) / entry.challenges_completed) : 0;
                
                return (
                  <TableRow 
                    key={entry.id || entry.username}
                    sx={{ 
                      bgcolor: isCurrentUser ? 'rgba(12, 192, 223, 0.1)' : 'transparent',
                      '&:hover': { 
                        bgcolor: isCurrentUser ? 'rgba(12, 192, 223, 0.2)' : 'rgba(255, 255, 255, 0.05)' 
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          #{index + 1}
                        </Typography>
                        {index === 0 && <Typography>🥇</Typography>}
                        {index === 1 && <Typography>🥈</Typography>}
                        {index === 2 && <Typography>🥉</Typography>}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getScoreColor(entry.total_score || 0) }}>
                          {entry.username?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                            {entry.username}
                            {isCurrentUser && (
                              <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {entry.challenges_completed || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: getScoreColor(entry.total_score || 0)
                        }}
                      >
                        {entry.total_score || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: getScoreColor(averageScore)
                        }}
                      >
                        {averageScore}%
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={getRank(entry.challenges_completed || 0, entry.total_score || 0)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {sortedLeaderboard.length === 0 && (
          <Box className="text-center" sx={{ py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No leaderboard data available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete some challenges to see rankings
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LeaderboardPage;