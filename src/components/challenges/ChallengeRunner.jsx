import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { submitChallenge } from '../../store/challengeSlice';

const ChallengeRunner = ({ challenge, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await dispatch(submitChallenge({
        challengeId: challenge.id,
        submission: { completed: true }
      })).unwrap();
      
      onComplete(result);
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {challenge.title}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {challenge.description}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This is a demo challenge. In a real implementation, this would contain 
        interactive elements, robot controls, quizzes, or other learning activities.
      </Alert>
      
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Complete Challenge'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChallengeRunner;