// src/components/challenges/ManualMovementChallenge.jsx
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Grid, Alert } from '@mui/material';
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward, RotateLeft, RotateRight } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import RobotVisualizer from './RobotVisualizer';

const ManualMovementChallenge = ({ onComplete }) => {
  const { isConnected, position, status } = useSelector(state => state.robot);
  const [moveCount, setMoveCount] = useState(0);
  const [targetReached, setTargetReached] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const targetPosition = { x: 5, y: 5, rotation: 0 };

  useEffect(() => {
    if (!startTime && moveCount > 0) {
      setStartTime(Date.now());
    }
  }, [moveCount, startTime]);

  useEffect(() => {
    // Check if target position is reached
    const isAtTarget = Math.abs(position.x - targetPosition.x) < 0.5 &&
                      Math.abs(position.y - targetPosition.y) < 0.5;
    
    if (isAtTarget && !targetReached && moveCount > 0) {
      setTargetReached(true);
      const completionTime = Date.now() - startTime;
      const efficiency = Math.max(100 - moveCount * 2, 10);
      
      onComplete({
        success: true,
        moveCount,
        timeElapsed: Math.floor(completionTime / 1000),
        efficiency,
        score: Math.floor(efficiency * (3000 / completionTime))
      });
    }
  }, [position, targetReached, moveCount, startTime, onComplete]);

  const moveRobot = async (direction) => {
    if (!isConnected) return;
    
    setMoveCount(prev => prev + 1);
    
    // Here you would send actual commands to the robot
    console.log(`Moving robot: ${direction}`);
    
    // Simulate robot movement for demo
    // In real implementation, this would interface with robot hardware
  };

  const movementButtons = [
    { label: 'Forward', icon: ArrowUpward, action: () => moveRobot('forward') },
    { label: 'Backward', icon: ArrowDownward, action: () => moveRobot('backward') },
    { label: 'Left', icon: ArrowBack, action: () => moveRobot('left') },
    { label: 'Right', icon: ArrowForward, action: () => moveRobot('right') },
    { label: 'Rotate Left', icon: RotateLeft, action: () => moveRobot('rotate_left') },
    { label: 'Rotate Right', icon: RotateRight, action: () => moveRobot('rotate_right') }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manual Movement Challenge
        </Typography>
        
        <Typography variant="body1" paragraph>
          Use the movement controls to guide your robot to the target position (5, 5). 
          Try to reach the target with the fewest moves possible!
        </Typography>

        {!isConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Robot is not connected. Please check your connection.
          </Alert>
        )}

        <Box display="flex" gap={4} mb={3}>
          <Typography variant="h6">
            Moves: {moveCount}
          </Typography>
          <Typography variant="h6">
            Current: ({position.x.toFixed(1)}, {position.y.toFixed(1)})
          </Typography>
          <Typography variant="h6">
            Target: ({targetPosition.x}, {targetPosition.y})
          </Typography>
        </Box>

        {targetReached && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Congratulations! You've reached the target position!
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Robot Controls
            </Typography>
            
            <Grid container spacing={2}>
              {movementButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                  <Grid item xs={6} key={index}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Icon />}
                      onClick={button.action}
                      disabled={!isConnected || targetReached}
                      sx={{ py: 2 }}
                    >
                      {button.label}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <RobotVisualizer 
            challengeType="manual"
            targetPosition={targetPosition}
            showTarget={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManualMovementChallenge;