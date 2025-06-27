// =================== RobotDashboard.jsx ===================
import React, { useState } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Paper,
  Alert
} from '@mui/material';
import { 
  Dashboard, 
  Settings, 
  Timeline, 
  Security,
  Memory,
  Calculate
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import RobotVisualizer from './RobotVisualizer';
import ControlPanel from './ControlPanel';
import SafetyControls from './SafetyControls';
import MotorStatus from './MotorStatus';
import CalibrationTool from './CalibrationTool';
import KinematicsDisplay from './KinematicsDisplay';
import TrajectoryPlanner from './TrajectoryPlanner';
import RobotLogger from './RobotLogger';
import { ConnectionStatus } from '../common';

const RobotDashboard = ({ layout = 'standard' }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { connected } = useSelector(state => state.robot);

  const tabs = [
    { label: 'Control', icon: <Dashboard />, component: 'control' },
    { label: 'Kinematics', icon: <Calculate />, component: 'kinematics' },
    { label: 'Trajectory', icon: <Timeline />, component: 'trajectory' },
    { label: 'Safety', icon: <Security />, component: 'safety' },
    { label: 'Motors', icon: <Memory />, component: 'motors' },
    { label: 'Calibration', icon: <Settings />, component: 'calibration' },
    { label: 'Logger', icon: <Timeline />, component: 'logger' }
  ];

  const renderTabContent = () => {
    const currentTab = tabs[activeTab].component;
    
    switch (currentTab) {
      case 'control':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <RobotVisualizer height={400} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ControlPanel />
            </Grid>
          </Grid>
        );
        
      case 'kinematics':
        return <KinematicsDisplay />;
        
      case 'trajectory':
        return <TrajectoryPlanner />;
        
      case 'safety':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <SafetyControls />
            </Grid>
            <Grid item xs={12} md={4}>
              <ConnectionStatus />
            </Grid>
          </Grid>
        );
        
      case 'motors':
        return <MotorStatus />;
        
      case 'calibration':
        return <CalibrationTool />;
        
      case 'logger':
        return <RobotLogger />;
        
      default:
        return (
          <Alert severity="info">
            Select a tab to view robot controls and information.
          </Alert>
        );
    }
  };

  if (layout === 'compact') {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <RobotVisualizer height={300} compact />
          </Grid>
          <Grid item xs={12} md={6}>
            <ControlPanel compact />
          </Grid>
          <Grid item xs={12}>
            <MotorStatus compact />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ borderRadius: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Robot Control Dashboard
          </Typography>
          
          <ConnectionStatus compact={true} />
        </Box>
        
        {/* Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {!connected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Robot is not connected. Some features may be unavailable.
          </Alert>
        )}
        
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default RobotDashboard;