// // src/pages/ChallengesListPage.jsx
// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Container, Grid, Typography, Box, Paper, Card, CardContent, Button, Chip } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { PlayArrow, CheckCircle, Lock } from '@mui/icons-material';
// import { fetchChallenges } from '../store/challengeSlice';
// import LoadingSpinner from '../components/common/LoadingSpinner';

// const ChallengesListPage = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector(state => state.auth);
//   const { challenges, userProgress, loading, error } = useSelector(state => state.challenges);

//   useEffect(() => {
//     dispatch(fetchChallenges());
//   }, [dispatch]);

//   const handleChallengeClick = (challengeId) => {
//     navigate(`/challenges/${challengeId}`);
//   };

//   if (loading) {
//     return (
//       <Box className="flex-center" style={{ minHeight: '60vh' }}>
//         <LoadingSpinner message="Loading challenges..." />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl">
//       <Box sx={{ py: 4 }}>
//         {/* Header */}
//         <Typography variant="h3" component="h1" gutterBottom className="text-center">
//           🤖 Robotics Challenges
//         </Typography>
//         <Typography variant="h6" color="text.secondary" gutterBottom className="text-center" sx={{ mb: 4 }}>
//           Complete hands-on robotics challenges to build your skills
//         </Typography>

//         {/* Debug Info - Remove this after testing */}
//         <Paper sx={{ p: 2, mb: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
//           <Typography variant="subtitle2" gutterBottom>
//             🔍 Debug Info:
//           </Typography>
//           <Typography variant="body2">
//             • Challenges loaded: {challenges?.length || 0}<br/>
//             • Loading: {loading ? 'Yes' : 'No'}<br/>
//             • Error: {error || 'None'}<br/>
//             • User authenticated: {user ? `Yes (${user.username})` : 'No'}
//           </Typography>
//         </Paper>

//         {/* Error State */}
//         {error && (
//           <Paper sx={{ p: 3, mb: 4, bgcolor: 'error.dark' }}>
//             <Typography variant="h6" color="error.light">
//               ❌ Error Loading Challenges
//             </Typography>
//             <Typography variant="body2" color="error.light">
//               {error}
//             </Typography>
//             <Button 
//               variant="outlined" 
//               onClick={() => dispatch(fetchChallenges())}
//               sx={{ mt: 2 }}
//             >
//               Retry
//             </Button>
//           </Paper>
//         )}

//         {/* Challenges Grid */}
//         {challenges && challenges.length > 0 ? (
//           <Grid container spacing={3}>
//             {challenges.map((challenge, index) => (
//               <Grid item key={challenge.id || index} xs={12} sm={6} md={4} lg={3}>
//                 <Card 
//                   sx={{ 
//                     height: '100%',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     cursor: 'pointer',
//                     transition: 'transform 0.2s, box-shadow 0.2s',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                       boxShadow: 4
//                     },
//                     bgcolor: challenge.is_completed ? 'rgba(76, 175, 80, 0.1)' : 
//                            challenge.is_unlocked ? 'background.paper' : 'rgba(158, 158, 158, 0.1)'
//                   }}
//                   onClick={() => challenge.is_unlocked && handleChallengeClick(challenge.id)}
//                 >
//                   <CardContent sx={{ flexGrow: 1, p: 3 }}>
//                     {/* Challenge Status Icon */}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                       <Typography variant="h6" component="h3">
//                         Challenge {challenge.id || index + 1}
//                       </Typography>
//                       {challenge.is_completed ? (
//                         <CheckCircle color="success" />
//                       ) : challenge.is_unlocked ? (
//                         <PlayArrow color="primary" />
//                       ) : (
//                         <Lock color="disabled" />
//                       )}
//                     </Box>

//                     {/* Challenge Title */}
//                     <Typography variant="h6" gutterBottom>
//                       {challenge.title || `Challenge ${index + 1}`}
//                     </Typography>

//                     {/* Challenge Description */}
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                       {challenge.description || 'Complete this robotics challenge to earn points and improve your skills.'}
//                     </Typography>

//                     {/* Difficulty Badge */}
//                     <Box sx={{ mb: 2 }}>
//                       <Chip
//                         label={challenge.difficulty || 'Beginner'}
//                         size="small"
//                         color={
//                           challenge.difficulty === 'Expert' ? 'error' :
//                           challenge.difficulty === 'Advanced' ? 'warning' :
//                           challenge.difficulty === 'Intermediate' ? 'info' : 'success'
//                         }
//                       />
//                     </Box>

//                     {/* Challenge Stats */}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {challenge.estimated_time || 30} min
//                       </Typography>
                      
//                       {challenge.is_completed && challenge.best_score && (
//                         <Chip
//                           label={`Score: ${challenge.best_score}`}
//                           size="small"
//                           color="success"
//                           variant="outlined"
//                         />
//                       )}
//                     </Box>

//                     {/* Challenge Status */}
//                     <Box sx={{ mt: 2 }}>
//                       <Chip
//                         label={
//                           challenge.is_completed ? 'Completed' :
//                           challenge.is_unlocked ? 'Available' : 'Locked'
//                         }
//                         size="small"
//                         color={
//                           challenge.is_completed ? 'success' :
//                           challenge.is_unlocked ? 'primary' : 'default'
//                         }
//                         variant={challenge.is_unlocked ? 'filled' : 'outlined'}
//                       />
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           /* No Challenges State */
//           <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
//             <Typography variant="h5" gutterBottom>
//               🚧 No Challenges Available
//             </Typography>
//             <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//               It looks like no challenges have been loaded yet.
//             </Typography>
            
//             {/* Create Mock Challenges Button for Testing */}
//             <Button 
//               variant="outlined" 
//               onClick={() => {
//                 // Create mock challenges for testing
//                 const mockChallenges = [
//                   {
//                     id: 1,
//                     title: 'Basic Joint Movement',
//                     description: 'Learn to control individual robot joints and understand forward kinematics.',
//                     difficulty: 'Beginner',
//                     estimated_time: 30,
//                     is_unlocked: true,
//                     is_completed: false
//                   },
//                   {
//                     id: 2,
//                     title: 'Position Control',
//                     description: 'Move the robot end-effector to specific positions in 3D space.',
//                     difficulty: 'Intermediate',
//                     estimated_time: 45,
//                     is_unlocked: true,
//                     is_completed: false
//                   },
//                   {
//                     id: 3,
//                     title: 'Path Planning',
//                     description: 'Plan and execute smooth trajectories between multiple points.',
//                     difficulty: 'Advanced',
//                     estimated_time: 60,
//                     is_unlocked: false,
//                     is_completed: false
//                   }
//                 ];
                
//                 // For now, just show alert. In real app, you'd dispatch to store
//                 alert(`Mock data: ${mockChallenges.length} challenges would be loaded`);
//                 console.log('Mock challenges:', mockChallenges);
//               }}
//               sx={{ mr: 2 }}
//             >
//               🔧 Load Test Challenges
//             </Button>
            
//             <Button 
//               variant="contained"
//               onClick={() => dispatch(fetchChallenges())}
//             >
//               🔄 Refresh Challenges
//             </Button>
//           </Paper>
//         )}

//         {/* User Progress Summary */}
//         {userProgress && (
//           <Paper sx={{ p: 3, mt: 4, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
//             <Typography variant="h6" gutterBottom>
//               📊 Your Progress
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={6} sm={3}>
//                 <Typography variant="h4" color="primary">
//                   {userProgress.challengesCompleted || 0}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Completed
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 <Typography variant="h4" color="primary">
//                   {userProgress.totalScore || 0}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Total Score
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 <Typography variant="h4" color="primary">
//                   {userProgress.streakCount || 0}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Streak
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 <Typography variant="h4" color="primary">
//                   {userProgress.rank || 'Beginner'}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Rank
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Paper>
//         )}
//       </Box>
//     </Container>
//   );
// };

// export default ChallengesListPage;

// Add this to your ChallengesListPage.jsx temporarily

// src/pages/ChallengesListPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Grid, Typography, Box, Paper, Card, CardContent, Button, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow, CheckCircle, Lock, Refresh } from '@mui/icons-material';
import { fetchChallenges } from '../store/challengeSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChallengesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { challenges, userProgress, loading, error } = useSelector(state => state.challenges);

  useEffect(() => {
    dispatch(fetchChallenges());
  }, [dispatch]);

  const handleChallengeClick = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

  const handleRetry = () => {
    dispatch(fetchChallenges());
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box className="flex-center" style={{ minHeight: '60vh' }}>
          <LoadingSpinner message="Loading challenges..." />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom className="text-center">
          🤖 Robotics Challenges
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom className="text-center" sx={{ mb: 4 }}>
          Complete hands-on robotics challenges to build your skills
        </Typography>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Unable to load challenges
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleRetry}>
              Try Again
            </Button>
          </Alert>
        )}

        {/* Challenges Grid */}
        {challenges && challenges.length > 0 ? (
          <Grid container spacing={3}>
            {challenges.map((challenge, index) => (
              <Grid item key={challenge.id || index} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: challenge.is_unlocked !== false ? 'pointer' : 'not-allowed',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': challenge.is_unlocked !== false ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    } : {},
                    bgcolor: challenge.is_completed ? 'rgba(76, 175, 80, 0.1)' : 
                           challenge.is_unlocked !== false ? 'background.paper' : 'rgba(158, 158, 158, 0.1)',
                    opacity: challenge.is_unlocked === false ? 0.6 : 1
                  }}
                  onClick={() => challenge.is_unlocked !== false && handleChallengeClick(challenge.id)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Challenge Status Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        Challenge {challenge.id || index + 1}
                      </Typography>
                      {challenge.is_completed ? (
                        <CheckCircle color="success" />
                      ) : challenge.is_unlocked !== false ? (
                        <PlayArrow color="primary" />
                      ) : (
                        <Lock color="disabled" />
                      )}
                    </Box>

                    {/* Challenge Title */}
                    <Typography variant="h6" gutterBottom>
                      {challenge.title || `Challenge ${index + 1}`}
                    </Typography>

                    {/* Challenge Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {challenge.description || 'Complete this robotics challenge to earn points and improve your skills.'}
                    </Typography>

                    {/* Difficulty Badge */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={challenge.difficulty || 'Beginner'}
                        size="small"
                        color={
                          (challenge.difficulty || '').toLowerCase() === 'expert' ? 'error' :
                          (challenge.difficulty || '').toLowerCase() === 'advanced' ? 'warning' :
                          (challenge.difficulty || '').toLowerCase() === 'intermediate' ? 'info' : 'success'
                        }
                      />
                    </Box>

                    {/* Challenge Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {challenge.estimated_time || 30} min
                      </Typography>
                      
                      {challenge.is_completed && challenge.best_score && (
                        <Chip
                          label={`Score: ${challenge.best_score}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Challenge Status */}
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={
                          challenge.is_completed ? 'Completed' :
                          challenge.is_unlocked !== false ? 'Available' : 'Locked'
                        }
                        size="small"
                        color={
                          challenge.is_completed ? 'success' :
                          challenge.is_unlocked !== false ? 'primary' : 'default'
                        }
                        variant={challenge.is_unlocked !== false ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : !loading && !error ? (
          /* No Challenges State */
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h5" gutterBottom>
              🚧 No Challenges Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              It looks like no challenges have been loaded yet. This could be because:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              • The backend server is not running<br/>
              • There are no challenges in the database<br/>
              • There's a network connectivity issue
            </Typography>
            
            <Button 
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRetry}
              sx={{ mr: 2 }}
            >
              🔄 Retry Loading
            </Button>
          </Paper>
        ) : null}

        {/* User Progress Summary */}
        {userProgress && (
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
            <Typography variant="h6" gutterBottom>
              📊 Your Progress
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="primary">
                  {userProgress.challengesCompleted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="primary">
                  {userProgress.totalScore || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Score
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="primary">
                  {userProgress.streakCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Streak
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="primary">
                  {userProgress.rank || 'Beginner'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rank
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ChallengesListPage;