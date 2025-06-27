// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Button, 
  TextField,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Cancel,
  School,
  TrendingUp,
  EmojiEvents,
  History
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';
import { fetchUserProgress } from '../store/challengeSlice';
import { getRank, getScoreColor } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector(state => state.auth);
  const { userProgress, challenges, loading: challengesLoading } = useSelector(state => state.challenges);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    display_name: user?.display_name || ''
  });

  useEffect(() => {
    dispatch(fetchUserProgress());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        display_name: user.display_name || ''
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      
      await dispatch(updateUserProfile(editedUser)).unwrap();
      
      setIsEditing(false);
      setSaveMessage({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setSaveMessage({ type: 'error', message: error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      display_name: user?.display_name || ''
    });
    setIsEditing(false);
    setSaveMessage(null);
  };

  if (authLoading || challengesLoading) {
    return (
      <Box className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner message="Loading profile..." />
      </Box>
    );
  }

  const completedChallenges = challenges?.filter(c => c.is_completed) || [];
  const averageScore = completedChallenges.length > 0 ? 
    Math.round(userProgress?.totalScore / completedChallenges.length) : 0;
  const userRank = getRank(completedChallenges.length, userProgress?.totalScore || 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom className="text-center">
          Profile
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom className="text-center" sx={{ mb: 4 }}>
          Manage your account and view your achievements
        </Typography>

        {/* Save Message */}
        {saveMessage && (
          <Alert severity={saveMessage.type} sx={{ mb: 3 }}>
            {saveMessage.message}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.paper', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: getScoreColor(averageScore),
                    fontSize: '3rem'
                  }}
                >
                  {(user?.display_name || user?.username)?.charAt(0)?.toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" gutterBottom>
                  {user?.display_name || user?.username}
                </Typography>
                
                <Chip
                  label={userRank}
                  color="primary"
                  sx={{ mb: 2, fontSize: '0.9rem', py: 1 }}
                />
                
                <Box sx={{ mt: 3 }}>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      fullWidth
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                        fullWidth
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={saving}
                        fullWidth
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ bgcolor: 'background.paper', mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Quick Stats
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Challenges Completed
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {completedChallenges.length} / {challenges?.length || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Score
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    sx={{ color: getScoreColor(userProgress?.totalScore || 0) }}
                  >
                    {userProgress?.totalScore || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    sx={{ color: getScoreColor(averageScore) }}
                  >
                    {averageScore}%
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Rank
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {userRank}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Profile Details & History */}
          <Grid item xs={12} md={8}>
            {/* Profile Information */}
            <Card sx={{ bgcolor: 'background.paper', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 Profile Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={editedUser.display_name}
                      onChange={(e) => setEditedUser({...editedUser, display_name: e.target.value})}
                      disabled={!isEditing}
                      variant="outlined"
                      helperText="How your name appears to others"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={editedUser.bio}
                      onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Tell us about yourself..."
                      helperText={`${editedUser.bio.length}/500 characters`}
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Achievement History */}
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History />
                  Challenge History
                </Typography>
                
                {completedChallenges.length > 0 ? (
                  <Box>
                    {completedChallenges.slice().reverse().map((challenge, index) => (
                      <Box key={challenge.id}>
                        <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              Challenge {challenge.id}: {challenge.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Completed on {challenge.completion_date || 'Unknown date'}
                            </Typography>
                            <Chip
                              label={challenge.difficulty || 'Beginner'}
                              size="small"
                              sx={{ mt: 1 }}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: getScoreColor(challenge.best_score || 0),
                                fontWeight: 'bold'
                              }}
                            >
                              {challenge.best_score || 0}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Best Score
                            </Typography>
                          </Box>
                        </Box>
                        {index < completedChallenges.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box className="text-center" sx={{ py: 4 }}>
                    <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No challenges completed yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start completing challenges to see your history here!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;