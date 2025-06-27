// src/components/challenges/Challenge2.jsx (PD Control Challenge)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Slider,
  Grid,
  Button,
  Alert
} from '@mui/material';
import { Tune } from '@mui/icons-material';

const Challenge2 = ({ challenge, onDataChange, onError }) => {
  const [kp, setKp] = useState(1.0);
  const [kd, setKd] = useState(0.1);
  const [targetPosition, setTargetPosition] = useState(90);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [error, setError] = useState(90);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    // Simulate PD control response
    const simulateControl = () => {
      const newError = targetPosition - currentPosition;
      const output = kp * newError + kd * (newError - error);
      const newPosition = currentPosition + output * 0.1; // Simplified integration
      
      setCurrentPosition(newPosition);
      setError(newError);
      
      // Check if settled
      if (Math.abs(newError) < 2) {
        setSettling(true);
      }
    };

    const interval = setInterval(simulateControl, 100);
    return () => clearInterval(interval);
  }, [kp, kd, targetPosition, currentPosition, error]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        kp,
        kd,
        targetPosition,
        currentPosition,
        error: Math.abs(error),
        settled: settling
      });
    }
  }, [kp, kd, targetPosition, currentPosition, error, settling, onDataChange]);

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Tune sx={{ mr: 1, verticalAlign: 'middle' }} />
            PD Control Tuning Challenge
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tune the PD controller parameters to achieve fast, stable positioning with minimal overshoot.
          </Typography>

          {settling && (
            <Alert severity="success" sx={{ mb: 2 }}>
              System has settled! Error: ±{Math.abs(error).toFixed(1)}°
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Control Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                PD Parameters
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Proportional Gain (Kp): {kp.toFixed(2)}
                </Typography>
                <Slider
                  value={kp}
                  onChange={(_, value) => setKp(value)}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Derivative Gain (Kd): {kd.toFixed(2)}
                </Typography>
                <Slider
                  value={kd}
                  onChange={(_, value) => setKd(value)}
                  min={0.01}
                  max={1.0}
                  step={0.01}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Target Position: {targetPosition}°
                </Typography>
                <Slider
                  value={targetPosition}
                  onChange={(_, value) => setTargetPosition(value)}
                  min={0}
                  max={180}
                  step={5}
                />
              </Box>
            </Grid>

            {/* System Response */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                System Response
              </Typography>
              
              <Card sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="body2">
                  Current Position: <strong>{currentPosition.toFixed(1)}°</strong>
                </Typography>
                <Typography variant="body2">
                  Error: <strong>{error.toFixed(1)}°</strong>
                </Typography>
                <Typography variant="body2">
                  Status: <strong>{settling ? 'Settled' : 'Adjusting'}</strong>
                </Typography>
              </Card>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setCurrentPosition(0);
                  setSettling(false);
                }}
              >
                Reset System
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Challenge2;