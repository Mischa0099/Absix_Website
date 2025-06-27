// =================== CalibrationTool.jsx ===================
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Settings,
  CheckCircle,
  Warning,
  PlayArrow,
  Stop,
  Save
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { radToDeg, degToRad, formatNumber } from '../../utils/helpers';
import { LoadingSpinner } from '../common';

const CalibrationTool = () => {
  const {
    connected,
    jointAngles,
    setJointAngles,
    enableTorque,
    disableTorque,
    sendCommand
  } = useRobot();

  const [activeStep, setActiveStep] = useState(0);
  const [calibrationData, setCalibrationData] = useState({
    homePosition: [0, 0, 0],
    minPositions: [-180, -90, -90],
    maxPositions: [180, 90, 90],
    offsets: [0, 0, 0],
    deadZones: [1, 1, 1]
  });
  const [currentValues, setCurrentValues] = useState([0, 0, 0]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationResults, setCalibrationResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const calibrationSteps = [
    'System Check',
    'Home Position',
    'Range Calibration',
    'Offset Calculation',
    'Verification',
    'Save Calibration'
  ];

  useEffect(() => {
    if (jointAngles.length > 0) {
      setCurrentValues(jointAngles.map(radToDeg));
    }
  }, [jointAngles]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCalibrationResults(null);
    setErrors([]);
  };

  const startCalibration = async () => {
    setIsCalibrating(true);
    setErrors([]);
    
    try {
      // Enable torque on all joints
      for (let i = 1; i <= 3; i++) {
        await enableTorque(i);
      }
      
      // Run calibration step based on current step
      await runCalibrationStep(activeStep);
      
    } catch (error) {
      setErrors(prev => [...prev, error.message]);
    } finally {
      setIsCalibrating(false);
    }
  };

  const runCalibrationStep = async (step) => {
    switch (step) {
      case 0: // System Check
        await performSystemCheck();
        break;
      case 1: // Home Position
        await calibrateHomePosition();
        break;
      case 2: // Range Calibration
        await calibrateRange();
        break;
      case 3: // Offset Calculation
        await calculateOffsets();
        break;
      case 4: // Verification
        await verifyCalibration();
        break;
      case 5: // Save Calibration
        await saveCalibration();
        break;
    }
  };

  const performSystemCheck = async () => {
    const checks = [];
    
    // Check connection
    if (!connected) {
      throw new Error('Robot not connected');
    }
    checks.push('Connection: OK');
    
    // Check joint response
    for (let i = 0; i < 3; i++) {
      const testAngle = degToRad(10);
      await setJointAngles([...jointAngles.slice(0, i), testAngle, ...jointAngles.slice(i + 1)]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actualAngle = jointAngles[i];
      if (Math.abs(actualAngle - testAngle) > degToRad(5)) {
        throw new Error(`Joint ${i + 1} not responding correctly`);
      }
      checks.push(`Joint ${i + 1}: OK`);
    }
    
    setCalibrationResults({ systemCheck: checks });
  };

  const calibrateHomePosition = async () => {
    // Move to estimated home position
    const homeAngles = calibrationData.homePosition.map(degToRad);
    await setJointAngles(homeAngles);
    
    // Allow manual adjustment
    const finalHome = [...currentValues];
    setCalibrationData(prev => ({
      ...prev,
      homePosition: finalHome
    }));
    
    setCalibrationResults({ homePosition: finalHome });
  };

  const calibrateRange = async () => {
    const ranges = {};
    
    for (let i = 0; i < 3; i++) {
      // Find minimum position
      let minPos = currentValues[i];
      try {
        for (let angle = currentValues[i]; angle >= -180; angle -= 5) {
          const testAngles = [...currentValues];
          testAngles[i] = angle;
          await setJointAngles(testAngles.map(degToRad));
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if joint reached position
          if (Math.abs(radToDeg(jointAngles[i]) - angle) > 3) {
            break;
          }
          minPos = angle;
        }
      } catch (error) {
        console.warn(`Min range detection failed for joint ${i + 1}:`, error);
      }
      
      // Find maximum position
      let maxPos = currentValues[i];
      try {
        for (let angle = currentValues[i]; angle <= 180; angle += 5) {
          const testAngles = [...currentValues];
          testAngles[i] = angle;
          await setJointAngles(testAngles.map(degToRad));
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if joint reached position
          if (Math.abs(radToDeg(jointAngles[i]) - angle) > 3) {
            break;
          }
          maxPos = angle;
        }
      } catch (error) {
        console.warn(`Max range detection failed for joint ${i + 1}:`, error);
      }
      
      ranges[`joint${i + 1}`] = { min: minPos, max: maxPos };
    }
    
    setCalibrationResults({ ranges });
  };

  const calculateOffsets = async () => {
    const offsets = [];
    
    // Move to known reference positions and calculate offsets
    const referencePositions = [
      [0, 0, 0],
      [90, 0, 0],
      [0, 45, 0],
      [0, 0, 45]
    ];
    
    for (const refPos of referencePositions) {
      await setJointAngles(refPos.map(degToRad));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actualPos = jointAngles.map(radToDeg);
      const offset = actualPos.map((actual, i) => refPos[i] - actual);
      offsets.push({ reference: refPos, actual: actualPos, offset });
    }
    
    // Calculate average offsets
    const avgOffsets = [0, 1, 2].map(i => {
      const sum = offsets.reduce((acc, o) => acc + o.offset[i], 0);
      return sum / offsets.length;
    });
    
    setCalibrationData(prev => ({
      ...prev,
      offsets: avgOffsets
    }));
    
    setCalibrationResults({ offsets: avgOffsets, measurements: offsets });
  };

  const verifyCalibration = async () => {
    const testPositions = [
      [45, 0, 0],
      [-45, 30, -30],
      [90, -45, 45],
      [0, 0, 90]
    ];
    
    const results = [];
    
    for (const testPos of testPositions) {
      // Apply calibration offsets
      const adjustedPos = testPos.map((angle, i) => angle + calibrationData.offsets[i]);
      
      await setJointAngles(adjustedPos.map(degToRad));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actualPos = jointAngles.map(radToDeg);
      const error = actualPos.map((actual, i) => Math.abs(testPos[i] - actual));
      const maxError = Math.max(...error);
      
      results.push({
        target: testPos,
        actual: actualPos,
        error: error,
        maxError: maxError,
        success: maxError < 2 // 2 degree tolerance
      });
    }
    
    setCalibrationResults({ verification: results });
  };

  const saveCalibration = async () => {
    try {
      const calibrationConfig = {
        ...calibrationData,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      // Send calibration to robot
      await sendCommand('save_calibration', calibrationConfig);
      
      // Also save locally
      localStorage.setItem('robotCalibration', JSON.stringify(calibrationConfig));
      
      setCalibrationResults({ saved: true, config: calibrationConfig });
    } catch (error) {
      throw new Error(`Failed to save calibration: ${error.message}`);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Checking robot system connectivity and basic functionality.
            </Typography>
            {calibrationResults?.systemCheck && (
              <Box sx={{ mt: 2 }}>
                {calibrationResults.systemCheck.map((check, index) => (
                  <Chip
                    key={index}
                    label={check}
                    color="success"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Define the robot's home position. Manually adjust joints to the desired home position.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {currentValues.map((value, index) => (
                <Grid item xs={4} key={index}>
                  <TextField
                    label={`Joint ${index + 1} (°)`}
                    value={formatNumber(value)}
                    disabled
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Automatically detecting joint range limits. This may take several minutes.
            </Typography>
            {calibrationResults?.ranges && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {Object.entries(calibrationResults.ranges).map(([joint, range]) => (
                  <Grid item xs={4} key={joint}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">{joint}</Typography>
                        <Typography variant="body2">
                          Min: {formatNumber(range.min)}°
                        </Typography>
                        <Typography variant="body2">
                          Max: {formatNumber(range.max)}°
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Calculating position offsets by moving to known reference positions.
            </Typography>
            {calibrationResults?.offsets && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Calculated Offsets:
                </Typography>
                {calibrationResults.offsets.map((offset, index) => (
                  <Typography key={index} variant="body2">
                    Joint {index + 1}: {formatNumber(offset)}°
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
        
      case 4:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Verifying calibration accuracy by testing various positions.
            </Typography>
            {calibrationResults?.verification && (
              <Box sx={{ mt: 2 }}>
                {calibrationResults.verification.map((result, index) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          Test {index + 1}: Max Error {formatNumber(result.maxError)}°
                        </Typography>
                        <Chip
                          label={result.success ? 'PASS' : 'FAIL'}
                          color={result.success ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        );
        
      case 5:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Save calibration data to robot memory and local storage.
            </Typography>
            {calibrationResults?.saved && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Calibration saved successfully!
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  if (!connected) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Alert severity="warning">
          Robot must be connected to perform calibration.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings color="primary" />
        Robot Calibration Tool
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Follow these steps to calibrate your robot for optimal performance and accuracy.
      </Typography>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Calibration Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {calibrationSteps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              optional={
                index === calibrationSteps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {label}
            </StepLabel>
            <StepContent>
              {renderStepContent(index)}
              
              <Box sx={{ mb: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={index === calibrationSteps.length - 1 ? handleReset : handleNext}
                  sx={{ mr: 1 }}
                  disabled={isCalibrating}
                  startIcon={isCalibrating ? <LoadingSpinner size={20} /> : 
                           index === calibrationSteps.length - 1 ? <CheckCircle /> : <PlayArrow />}
                >
                  {isCalibrating ? 'Processing...' :
                   index === calibrationSteps.length - 1 ? 'Finish' : 'Continue'}
                </Button>
                
                <Button
                  disabled={index === 0 || isCalibrating}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                
                {index < calibrationSteps.length - 1 && (
                  <Button
                    variant="outlined"
                    onClick={startCalibration}
                    disabled={isCalibrating}
                    startIcon={<PlayArrow />}
                  >
                    Run Step
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Progress Indicator */}
      {isCalibrating && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Calibrating... Please do not disconnect the robot.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CalibrationTool;