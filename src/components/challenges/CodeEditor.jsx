import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, IconButton, Typography, Chip, Tooltip } from '@mui/material';
import { PlayArrow, Stop, Code, Save, FolderOpen, Help } from '@mui/icons-material';

const CodeEditor = ({ 
  code, 
  onChange, 
  onExecute, 
  isExecuting = false, 
  language = 'python',
  theme = 'vs-dark',
  height = '400px' 
}) => {
  const textareaRef = useRef(null);
  const [lineNumbers, setLineNumbers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [hasErrors, setHasErrors] = useState(false);

  // Update line numbers when code changes
  useEffect(() => {
    const lines = code.split('\n');
    setLineNumbers(lines.map((_, index) => index + 1));
    
    // Simple syntax validation for Python
    const hasIndentationErrors = lines.some(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const leadingSpaces = line.length - line.trimStart().length;
        return leadingSpaces % 4 !== 0; // Python convention: 4 spaces
      }
      return false;
    });
    setHasErrors(hasIndentationErrors);
  }, [code]);

  // Handle cursor position updates
  const handleCursorChange = (e) => {
    const textarea = e.target;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line: currentLine, column: currentColumn });
  };

  // Handle key shortcuts
  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isExecuting) {
        onExecute();
      }
    }
    
    // Tab handling for better indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 4 spaces (Python convention)
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Sample code templates
  const codeTemplates = {
    basic: `# Basic robot movement
import robot_api as robot

robot.connect()
robot.move_joint(1, 30)
robot.move_joint(2, 0)
robot.move_joint(3, 0)`,
    
    advanced: `# Advanced movement with validation
import robot_api as robot
import time

def move_to_target(target_angles):
    robot.connect()
    
    for i, angle in enumerate(target_angles):
        print(f"Moving joint {i+1} to {angle}°")
        robot.move_joint(i+1, angle)
        time.sleep(0.5)
    
    # Verify position
    current = robot.get_position()
    error = robot.calculate_error(current, target_angles)
    print(f"Position error: {error:.2f}°")
    return error < 5.0

# Execute
success = move_to_target([30, 0, 0])`,
    
    kinematics: `# Forward kinematics example
import robot_api as robot
import math

def calculate_end_effector(angles):
    """Calculate end effector position"""
    L1, L2, L3 = 120, 100, 80  # Link lengths
    θ1, θ2, θ3 = [math.radians(a) for a in angles]
    
    x = L1*math.cos(θ1) + L2*math.cos(θ1+θ2) + L3*math.cos(θ1+θ2+θ3)
    y = L1*math.sin(θ1) + L2*math.sin(θ1+θ2) + L3*math.sin(θ1+θ2+θ3)
    
    return x, y

# Test calculation
target = [30, 0, 0]
end_pos = calculate_end_effector(target)
print(f"End effector at: ({end_pos[0]:.1f}, {end_pos[1]:.1f})")

# Move robot
robot.connect()
for i, angle in enumerate(target):
    robot.move_joint(i+1, angle)`
  };

  const loadTemplate = (templateName) => {
    onChange(codeTemplates[templateName]);
  };

  // Syntax highlighting (basic implementation)
  const highlightSyntax = (text) => {
    return text
      .replace(/(import|def|class|if|else|elif|for|while|try|except|finally|with|as|return|print)/g, 
               '<span style="color: #569cd6;">$1</span>')
      .replace(/(robot\.|time\.|math\.)/g, 
               '<span style="color: #4ec9b0;">$1</span>')
      .replace(/(#.*$)/gm, 
               '<span style="color: #6a9955;">$1</span>')
      .replace(/(".*?"|'.*?')/g, 
               '<span style="color: #ce9178;">$1</span>')
      .replace(/(\d+\.?\d*)/g, 
               '<span style="color: #b5cea8;">$1</span>');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e1e1e' }}>
      {/* Editor Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        bgcolor: '#2d2d30',
        borderBottom: 1,
        borderColor: '#3e3e42'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Code sx={{ color: '#569cd6' }} />
          <Typography variant="body2" sx={{ color: '#cccccc', fontFamily: 'monospace' }}>
            main.py
          </Typography>
          <Chip 
            label={language.toUpperCase()} 
            size="small" 
            sx={{ 
              bgcolor: '#569cd6', 
              color: 'white',
              fontSize: '10px',
              height: '20px'
            }} 
          />
          {hasErrors && (
            <Chip 
              label="Syntax Issues" 
              size="small" 
              color="error"
              sx={{ fontSize: '10px', height: '20px' }}
            />
          )}
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {/* Code Templates */}
          <Tooltip title="Load basic template">
            <IconButton 
              size="small" 
              onClick={() => loadTemplate('basic')}
              sx={{ color: '#cccccc' }}
            >
              📋
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Load advanced template">
            <IconButton 
              size="small" 
              onClick={() => loadTemplate('advanced')}
              sx={{ color: '#cccccc' }}
            >
              🚀
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Load kinematics example">
            <IconButton 
              size="small" 
              onClick={() => loadTemplate('kinematics')}
              sx={{ color: '#cccccc' }}
            >
              📐
            </IconButton>
          </Tooltip>
          
          {/* Action buttons */}
          <Tooltip title="Save code">
            <IconButton size="small" sx={{ color: '#cccccc' }}>
              <Save fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Load code">
            <IconButton size="small" sx={{ color: '#cccccc' }}>
              <FolderOpen fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Help & Documentation">
            <IconButton size="small" sx={{ color: '#cccccc' }}>
              <Help fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Editor Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Line Numbers */}
        <Box sx={{ 
          width: '50px',
          bgcolor: '#252526',
          borderRight: 1,
          borderColor: '#3e3e42',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 1, pt: 2 }}>
            {lineNumbers.map(num => (
              <Typography 
                key={num}
                variant="body2"
                sx={{ 
                  color: '#858585',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '18px',
                  textAlign: 'right',
                  pr: 1
                }}
              >
                {num}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Code Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleCursorChange}
            onKeyUp={handleCursorChange}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: '#1e1e1e',
              color: '#cccccc',
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '14px',
              lineHeight: '18px',
              padding: '16px 12px',
              resize: 'none',
              tabSize: 4
            }}
            spellCheck={false}
            placeholder="# Write your Python code here...
# Use robot_api to control the robot
# Example: robot.move_joint(1, 30)"
          />
        </Box>
      </Box>

      {/* Status Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        bgcolor: '#007acc',
        minHeight: '30px'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
            Python
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
            UTF-8
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
            Press Ctrl+Enter to execute
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            startIcon={isExecuting ? <Stop /> : <PlayArrow />}
            onClick={onExecute}
            disabled={isExecuting}
            sx={{
              bgcolor: isExecuting ? '#ff6b35' : '#28a745',
              '&:hover': {
                bgcolor: isExecuting ? '#e55a2b' : '#218838'
              },
              minWidth: '100px',
              height: '24px',
              fontSize: '11px'
            }}
          >
            {isExecuting ? 'Running...' : 'Execute'}
          </Button>
        </Box>
      </Box>

      {/* Floating Help Panel */}
      <Box sx={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        bgcolor: 'rgba(0,0,0,0.8)',
        color: 'white',
        p: 1,
        borderRadius: 1,
        fontSize: '10px',
        maxWidth: '200px',
        opacity: 0.7,
        zIndex: 1000
      }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
          Quick Reference:
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          robot.connect() - Connect to robot
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          robot.move_joint(id, angle) - Move joint
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          robot.get_position() - Get current angles
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          time.sleep(seconds) - Wait
        </Typography>
      </Box>
    </Box>
  );
};

export default CodeEditor;