// =================== RobotLogger.jsx ===================
import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Download,
  Clear,
  Visibility,
  Delete,
  FilterList,
  Save
} from '@mui/icons-material';
import { useRobot } from '../../hooks/useRobot';
import { useSelector } from 'react-redux';
import { formatNumber, radToDeg } from '../../utils/helpers';
import { useNotification } from '../common/Notification';

const RobotLogger = () => {
  const { connected, jointAngles, jointVelocities } = useRobot();
  const { actuators } = useSelector(state => state.robot);
  const { showNotification } = useNotification();

  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logSettings, setLogSettings] = useState({
    frequency: 50, // Hz
    includePositions: true,
    includeVelocities: true,
    includeTemperatures: true,
    includeCurrents: true,
    includeVoltages: false,
    autoSave: false,
    maxEntries: 10000
  });
  const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'warnings', 'errors'
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [logName, setLogName] = useState('');

  const logIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Start/Stop logging
  useEffect(() => {
    if (isLogging && connected) {
      startTimeRef.current = Date.now();
      
      logIntervalRef.current = setInterval(() => {
        const timestamp = Date.now();
        const relativeTime = (timestamp - startTimeRef.current) / 1000;
        
        const entry = {
          timestamp,
          relativeTime,
          ...(logSettings.includePositions && { 
            positions: jointAngles.map(radToDeg) 
          }),
          ...(logSettings.includeVelocities && { 
            velocities: jointVelocities.map(radToDeg) 
          }),
          ...(logSettings.includeTemperatures && actuators && {
            temperatures: Object.values(actuators).map(a => a.present_temperature || 0)
          }),
          ...(logSettings.includeCurrents && actuators && {
            currents: Object.values(actuators).map(a => a.present_current || 0)
          }),
          ...(logSettings.includeVoltages && actuators && {
            voltages: Object.values(actuators).map(a => a.present_voltage || 0)
          })
        };

        setLogData(prev => {
          const newData = [...prev, entry];
          
          // Limit entries to prevent memory issues
          if (newData.length > logSettings.maxEntries) {
            return newData.slice(-logSettings.maxEntries);
          }
          
          return newData;
        });
      }, 1000 / logSettings.frequency);
    } else {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    }

    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
    };
  }, [isLogging, connected, logSettings, jointAngles, jointVelocities, actuators]);

  // Auto-save functionality
  useEffect(() => {
    if (logSettings.autoSave && logData.length > 0 && logData.length % 1000 === 0) {
      handleAutoSave();
    }
  }, [logData.length, logSettings.autoSave]);

  const handleStartLogging = () => {
    if (!connected) {
      showNotification('Robot must be connected to start logging', 'error');
      return;
    }
    
    setIsLogging(true);
    showNotification('Logging started', 'success');
  };

  const handleStopLogging = () => {
    setIsLogging(false);
    showNotification(`Logging stopped. Captured ${logData.length} entries`, 'info');
  };

  const handleClearLog = () => {
    setLogData([]);
    showNotification('Log data cleared', 'info');
  };

  const handleAutoSave = () => {
    const fileName = `robot_log_auto_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    const data = {
      metadata: {
        name: fileName,
        startTime: startTimeRef.current,
        endTime: Date.now(),
        settings: logSettings,
        entryCount: logData.length
      },
      data: logData
    };
    
    localStorage.setItem(fileName, JSON.stringify(data));
    showNotification('Auto-save completed', 'success');
  };

  const handleExport = () => {
    if (logData.length === 0) {
      showNotification('No data to export', 'warning');
      return;
    }
    
    const fileName = logName || `robot_log_${new Date().toISOString().split('T')[0]}`;
    
    let content, mimeType, fileExtension;
    
    switch (exportFormat) {
      case 'csv':
        content = generateCSV();
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'json':
        content = JSON.stringify({
          metadata: {
            name: fileName,
            exportTime: new Date().toISOString(),
            settings: logSettings,
            entryCount: logData.length
          },
          data: logData
        }, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'matlab':
        content = generateMATLAB();
        mimeType = 'text/plain';
        fileExtension = 'm';
        break;
      default:
        content = JSON.stringify(logData);
        mimeType = 'application/json';
        fileExtension = 'json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportDialogOpen(false);
    showNotification(`Data exported as ${fileName}.${fileExtension}`, 'success');
  };

  const generateCSV = () => {
    if (logData.length === 0) return '';
    
    const headers = ['timestamp', 'time_sec'];
    
    if (logSettings.includePositions) {
      headers.push('joint1_pos', 'joint2_pos', 'joint3_pos');
    }
    if (logSettings.includeVelocities) {
      headers.push('joint1_vel', 'joint2_vel', 'joint3_vel');
    }
    if (logSettings.includeTemperatures) {
      headers.push('motor1_temp', 'motor2_temp', 'motor3_temp');
    }
    if (logSettings.includeCurrents) {
      headers.push('motor1_current', 'motor2_current', 'motor3_current');
    }
    if (logSettings.includeVoltages) {
      headers.push('motor1_voltage', 'motor2_voltage', 'motor3_voltage');
    }
    
    let csv = headers.join(',') + '\n';
    
    logData.forEach(entry => {
      const row = [entry.timestamp, entry.relativeTime.toFixed(3)];
      
      if (logSettings.includePositions && entry.positions) {
        row.push(...entry.positions.map(p => formatNumber(p, 3)));
      }
      if (logSettings.includeVelocities && entry.velocities) {
        row.push(...entry.velocities.map(v => formatNumber(v, 3)));
      }
      if (logSettings.includeTemperatures && entry.temperatures) {
        row.push(...entry.temperatures.map(t => formatNumber(t, 2)));
      }
      if (logSettings.includeCurrents && entry.currents) {
        row.push(...entry.currents.map(c => formatNumber(c, 1)));
      }
      if (logSettings.includeVoltages && entry.voltages) {
        row.push(...entry.voltages.map(v => formatNumber(v, 2)));
      }
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  const generateMATLAB = () => {
    let matlab = `% Robot Data Log - Generated ${new Date().toISOString()}\n`;
    matlab += `% Total entries: ${logData.length}\n\n`;
    
    matlab += `time = [${logData.map(d => d.relativeTime.toFixed(3)).join(', ')}];\n\n`;
    
    if (logSettings.includePositions) {
      for (let i = 0; i < 3; i++) {
        matlab += `joint${i + 1}_pos = [${logData.map(d => d.positions ? formatNumber(d.positions[i], 3) : '0').join(', ')}];\n`;
      }
      matlab += '\n';
    }
    
    if (logSettings.includeVelocities) {
      for (let i = 0; i < 3; i++) {
        matlab += `joint${i + 1}_vel = [${logData.map(d => d.velocities ? formatNumber(d.velocities[i], 3) : '0').join(', ')}];\n`;
      }
      matlab += '\n';
    }
    
    if (logSettings.includeTemperatures) {
      for (let i = 0; i < 3; i++) {
        matlab += `motor${i + 1}_temp = [${logData.map(d => d.temperatures ? formatNumber(d.temperatures[i], 2) : '0').join(', ')}];\n`;
      }
    }
    
    return matlab;
  };

  const getFilteredData = () => {
    switch (filterLevel) {
      case 'warnings':
        return logData.filter(entry => {
          return entry.temperatures?.some(t => t > 60) || 
                 entry.currents?.some(c => Math.abs(c) > 800);
        });
      case 'errors':
        return logData.filter(entry => {
          return entry.temperatures?.some(t => t > 70) || 
                 entry.currents?.some(c => Math.abs(c) > 1000);
        });
      default:
        return logData;
    }
  };

  const filteredData = getFilteredData();

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Robot Data Logger
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record and export robot sensor data for analysis and debugging.
      </Typography>

      {/* Status and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={isLogging ? 'LOGGING' : 'STOPPED'}
                color={isLogging ? 'success' : 'default'}
                variant={isLogging ? 'filled' : 'outlined'}
              />
              <Typography variant="body2">
                Entries: {logData.length}
              </Typography>
              {isLogging && (
                <Typography variant="body2" color="text.secondary">
                  Rate: {logSettings.frequency} Hz
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isLogging ? (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleStartLogging}
                  disabled={!connected}
                  color="success"
                >
                  Start Logging
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={handleStopLogging}
                  color="error"
                >
                  Stop Logging
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
                disabled={logData.length === 0}
              >
                Export
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearLog}
                disabled={logData.length === 0 || isLogging}
                color="error"
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Settings */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={logSettings.frequency}
                onChange={(e) => setLogSettings(prev => ({ ...prev, frequency: e.target.value }))}
                label="Frequency"
                disabled={isLogging}
              >
                <MenuItem value={10}>10 Hz</MenuItem>
                <MenuItem value={20}>20 Hz</MenuItem>
                <MenuItem value={50}>50 Hz</MenuItem>
                <MenuItem value={100}>100 Hz</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={logSettings.includePositions}
                  onChange={(e) => setLogSettings(prev => ({ ...prev, includePositions: e.target.checked }))}
                  disabled={isLogging}
                />
              }
              label="Positions"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={logSettings.includeVelocities}
                  onChange={(e) => setLogSettings(prev => ({ ...prev, includeVelocities: e.target.checked }))}
                  disabled={isLogging}
                />
              }
              label="Velocities"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={logSettings.includeTemperatures}
                  onChange={(e) => setLogSettings(prev => ({ ...prev, includeTemperatures: e.target.checked }))}
                  disabled={isLogging}
                />
              }
              label="Temperatures"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={logSettings.autoSave}
                  onChange={(e) => setLogSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                />
              }
              label="Auto-save"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Data View */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Log Data ({filteredData.length} entries)
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                label="Filter"
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Data</MenuItem>
                <MenuItem value="warnings">Warnings Only</MenuItem>
                <MenuItem value="errors">Errors Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {filteredData.length > 0 ? (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {filteredData.slice(-50).map((entry, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`t=${entry.relativeTime.toFixed(2)}s`}
                      secondary={
                        <Box>
                          {entry.positions && (
                            <Typography variant="caption" display="block">
                              Pos: [{entry.positions.map(p => formatNumber(p, 1)).join(', ')}]°
                            </Typography>
                          )}
                          {entry.temperatures && (
                            <Typography variant="caption" display="block">
                              Temp: [{entry.temperatures.map(t => formatNumber(t, 1)).join(', ')}]°C
                            </Typography>
                          )}
                          {entry.currents && (
                            <Typography variant="caption" display="block">
                              Current: [{entry.currents.map(c => formatNumber(c, 0)).join(', ')}]mA
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              {filteredData.length > 50 && (
                <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block', textAlign: 'center' }}>
                  Showing last 50 entries of {filteredData.length}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {logData.length === 0 ? 'No data logged yet' : 'No data matches current filter'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Log Data</DialogTitle>
        <DialogContent>
          <TextField
            label="File Name"
            value={logName}
            onChange={(e) => setLogName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            placeholder={`robot_log_${new Date().toISOString().split('T')[0]}`}
          />
          
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Export Format"
            >
              <MenuItem value="csv">CSV (Comma Separated Values)</MenuItem>
              <MenuItem value="json">JSON (JavaScript Object Notation)</MenuItem>
              <MenuItem value="matlab">MATLAB Script (.m)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>

      {/* Connection Warning */}
      {!connected && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Robot must be connected to log data
        </Alert>
      )}
    </Paper>
  );
};

export default RobotLogger;