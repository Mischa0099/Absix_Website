// ===== GenericChallenge.jsx =====
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { Assignment, CheckBox, RadioButtonUnchecked } from '@mui/icons-material';

const GenericChallenge = ({ challenge, onDataChange, onError, started }) => {
  const [userNotes, setUserNotes] = useState('');
  const [checklist, setChecklist] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Generic challenge steps
  const steps = challenge.steps || [
    {
      label: 'Read Instructions',
      description: 'Carefully read through all challenge requirements and objectives.',
      required: true
    },
    {
      label: 'Setup Robot',
      description: 'Ensure the robot is properly connected and calibrated.',
      required: true
    },
    {
      label: 'Execute Task',
      description: 'Follow the challenge instructions to complete the required tasks.',
      required: true
    },
    {
      label: 'Document Results',
      description: 'Record your observations and results in the notes section.',
      required: false
    }
  ];

  useEffect(() => {
    // Initialize checklist
    const initialChecklist = {};
    steps.forEach((step, index) => {
      initialChecklist[index] = false;
    });
    setChecklist(initialChecklist);
  }, []);

  useEffect(() => {
    // Check if all required steps are completed
    const requiredSteps = steps.filter(step => step.required);
    const completedRequired = requiredSteps.every((step, index) => {
      const stepIndex = steps.findIndex(s => s === step);
      return checklist[stepIndex];
    });
    
    setCompleted(completedRequired);
    
    // Update parent component
    onDataChange && onDataChange({
      userNotes,
      checklist,
      currentStep,
      completed: completedRequired,
      stepsCompleted: Object.values(checklist).filter(Boolean).length,
      totalSteps: steps.length
    });
  }, [userNotes, checklist, currentStep]);

  const handleChecklistChange = (stepIndex, checked) => {
    setChecklist(prev => ({
      ...prev,
      [stepIndex]: checked
    }));

    // Auto-advance to next step if this step is completed
    if (checked && stepIndex === currentStep && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const getStepIcon = (stepIndex) => {
    if (checklist[stepIndex]) {
      return <CheckBox color="success" />;
    }
    return <RadioButtonUnchecked />;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {challenge.title || 'Challenge Instructions'}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {challenge.description || 'Follow the challenge instructions and use the robot controls below.'}
      </Typography>

      {/* Challenge Objectives */}
      {challenge.objectives && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Objectives
            </Typography>
            <List dense>
              {challenge.objectives.map((objective, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText primary={objective} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Progress Checklist */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progress Checklist
          </Typography>
          
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel 
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: 'pointer' }}
                  StepIconComponent={() => getStepIcon(index)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {step.label}
                    </Typography>
                    {step.required && (
                      <Typography variant="caption" color="error">
                        (Required)
                      </Typography>
                    )}
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {step.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox
                      checked={checklist[index] || false}
                      onChange={(e) => handleChecklistChange(index, e.target.checked)}
                    />
                    <Typography variant="body2">
                      Mark as completed
                    </Typography>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notes and Observations
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Record your observations, challenges faced, solutions implemented, and results obtained..."
            variant="outlined"
          />
        </CardContent>
      </Card>

      {/* Challenge Status */}
      <Alert 
        severity={completed ? "success" : "info"}
        sx={{ mb: 2 }}
      >
        {completed 
          ? "All required steps completed! You can now submit your challenge."
          : `Complete ${steps.filter(s => s.required).length - Object.values(checklist).filter(Boolean).length} more required steps to finish this challenge.`
        }
      </Alert>

      {/* Additional Instructions */}
      {challenge.additional_instructions && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {challenge.additional_instructions}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default GenericChallenge;