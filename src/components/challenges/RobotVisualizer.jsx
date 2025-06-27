import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Switch, FormControlLabel, Slider, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Speed, CenterFocusStrong, Timeline } from '@mui/icons-material';

const RobotVisualizer = ({
  jointAngles = [0, 0, 0],
  targetAngles = null,
  isAnimating = false,
  showWorkspace = true,
  showTrajectory = true,
  showTargetReached = false,
  config = {}
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const trajectoryRef = useRef([]);
  
  // State for visualization controls
  const [currentAngles, setCurrentAngles] = useState([0, 0, 0]);
  const [visualConfig, setVisualConfig] = useState({
    showWorkspace: showWorkspace,
    showTrajectory: showTrajectory,
    showGrid: true,
    showJointLabels: true,
    showVelocityVectors: false,
    animationSpeed: 0.05,
    zoom: 1.0,
    centerX: 0,
    centerY: 0,
    ...config
  });
  
  // Robot physical parameters
  const robotConfig = {
    links: [
      { length: 140, width: 24, color: '#e53e3e', name: 'Link 1', maxAngle: 150 },
      { length: 120, width: 20, color: '#38a169', name: 'Link 2', maxAngle: 120 },
      { length: 100, width: 16, color: '#805ad5', name: 'Link 3', maxAngle: 90 }
    ],
    joints: [
      { radius: 18, color: '#2d3748', limits: [-150, 150] },
      { radius: 15, color: '#4a5568', limits: [-120, 120] },
      { radius: 12, color: '#718096', limits: [-90, 90] }
    ],
    base: { radius: 30, height: 35, color: '#3182ce' },
    endEffector: { radius: 14, color: '#ed8936' }
  };

  // Smooth animation with easing
  useEffect(() => {
    if (isAnimating && targetAngles) {
      const animate = () => {
        setCurrentAngles(prevAngles => {
          const newAngles = prevAngles.map((current, i) => {
            const target = targetAngles[i] * Math.PI / 180;
            const diff = target - current;
            return current + diff * visualConfig.animationSpeed;
          });
          
          const hasReached = newAngles.every((angle, i) => 
            Math.abs(angle - targetAngles[i] * Math.PI / 180) < 0.01
          );
          
          if (!hasReached) {
            animationRef.current = requestAnimationFrame(animate);
          }
          
          return newAngles;
        });
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, targetAngles, visualConfig.animationSpeed]);

  // Update current angles when joint angles change
  useEffect(() => {
    if (!isAnimating) {
      setCurrentAngles(jointAngles.map(angle => angle * Math.PI / 180));
    }
  }, [jointAngles, isAnimating]);

  // Calculate forward kinematics
  const calculateForwardKinematics = useCallback((angles) => {
    const [θ1, θ2, θ3] = angles;
    const [L1, L2, L3] = robotConfig.links.map(link => link.length);
    
    const positions = [];
    
    // Base position (origin)
    positions.push({ x: 0, y: 0, angle: 0 });
    
    // Joint 1 position
    positions.push({
      x: L1 * Math.cos(θ1),
      y: L1 * Math.sin(θ1),
      angle: θ1
    });
    
    // Joint 2 position
    positions.push({
      x: positions[1].x + L2 * Math.cos(θ1 + θ2),
      y: positions[1].y + L2 * Math.sin(θ1 + θ2),
      angle: θ1 + θ2
    });
    
    // End effector position
    positions.push({
      x: positions[2].x + L3 * Math.cos(θ1 + θ2 + θ3),
      y: positions[2].y + L3 * Math.sin(θ1 + θ2 + θ3),
      angle: θ1 + θ2 + θ3
    });
    
    return positions;
  }, []);

  // Update trajectory
  useEffect(() => {
    const positions = calculateForwardKinematics(currentAngles);
    const endEffector = positions[positions.length - 1];
    
    if (visualConfig.showTrajectory && isAnimating) {
      trajectoryRef.current.push({ ...endEffector, timestamp: Date.now() });
      // Keep only last 100 points
      if (trajectoryRef.current.length > 100) {
        trajectoryRef.current = trajectoryRef.current.slice(-100);
      }
    }
  }, [currentAngles, visualConfig.showTrajectory, isAnimating, calculateForwardKinematics]);

  // Clear trajectory when needed
  const clearTrajectory = () => {
    trajectoryRef.current = [];
  };

  // Drawing functions
  const drawGrid = (ctx, canvas, centerX, centerY) => {
    if (!visualConfig.showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#f7fafc';
    ctx.lineWidth = 1;
    
    const gridSize = 40 * visualConfig.zoom;
    const offsetX = (centerX + visualConfig.centerX) % gridSize;
    const offsetY = (centerY + visualConfig.centerY) % gridSize;
    
    // Vertical lines
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawWorkspace = (ctx, centerX, centerY) => {
    if (!visualConfig.showWorkspace) return;
    
    const [L1, L2, L3] = robotConfig.links.map(link => link.length * visualConfig.zoom);
    const maxReach = L1 + L2 + L3;
    const minReach = Math.abs(L1 - L2 - L3);
    
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    // Maximum reach circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxReach, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Minimum reach circle (if exists)
    if (minReach > 10) {
      ctx.strokeStyle = '#fed7d7';
      ctx.beginPath();
      ctx.arc(centerX, centerY, minReach, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Add workspace labels
    ctx.fillStyle = '#a0aec0';
    ctx.font = '12px Arial';
    ctx.fillText(`Max: ${(maxReach / visualConfig.zoom).toFixed(0)}px`, 
                centerX + maxReach + 10, centerY);
    
    ctx.restore();
  };

  const drawCoordinateSystem = (ctx, centerX, centerY) => {
    ctx.save();
    ctx.lineWidth = 3;
    const axisLength = 80 * visualConfig.zoom;
    
    // X-axis (red)
    ctx.strokeStyle = '#f56565';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + axisLength, centerY);
    ctx.stroke();
    
    // Arrow head for X
    ctx.fillStyle = '#f56565';
    ctx.beginPath();
    ctx.moveTo(centerX + axisLength, centerY);
    ctx.lineTo(centerX + axisLength - 12, centerY - 6);
    ctx.lineTo(centerX + axisLength - 12, centerY + 6);
    ctx.fill();
    
    // Y-axis (green)
    ctx.strokeStyle = '#48bb78';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - axisLength);
    ctx.stroke();
    
    // Arrow head for Y
    ctx.fillStyle = '#48bb78';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - axisLength);
    ctx.lineTo(centerX - 6, centerY - axisLength + 12);
    ctx.lineTo(centerX + 6, centerY - axisLength + 12);
    ctx.fill();
    
    // Labels
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#f56565';
    ctx.fillText('X', centerX + axisLength + 15, centerY + 6);
    ctx.fillStyle = '#48bb78';
    ctx.fillText('Y', centerX + 8, centerY - axisLength - 10);
    
    ctx.restore();
  };

  const drawRobotBase = (ctx, centerX, centerY) => {
    const { radius, height, color } = robotConfig.base;
    const scaledRadius = radius * visualConfig.zoom;
    const scaledHeight = height * visualConfig.zoom;
    
    // Base shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY + 4, scaledRadius, scaledRadius * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Base cylinder
    const gradient = ctx.createLinearGradient(
      centerX - scaledRadius, centerY, 
      centerX + scaledRadius, centerY
    );
    gradient.addColorStop(0, '#2b6cb7');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, '#1a4780');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - scaledRadius, centerY - scaledHeight/2, 
                scaledRadius * 2, scaledHeight);
    
    // Base top
    ctx.fillStyle = '#4299e1';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - scaledHeight/2, scaledRadius, scaledRadius * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Base bottom
    ctx.fillStyle = '#1a4780';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + scaledHeight/2, scaledRadius, scaledRadius * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  const drawLink = (ctx, start, end, link, linkIndex) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const width = link.width * visualConfig.zoom;
    
    ctx.save();
    ctx.translate(start.x, start.y);
    ctx.rotate(angle);
    
    // Link shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(3, 3, length, width);
    
    // Link gradient
    const gradient = ctx.createLinearGradient(0, -width/2, 0, width/2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, link.color);
    gradient.addColorStop(0.7, link.color);
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, -width/2, length, width);
    
    // Link outline
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -width/2, length, width);
    
    // Link label
    if (visualConfig.showJointLabels) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, 12 * visualConfig.zoom)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(link.name, length/2, 4);
    }
    
    ctx.restore();
  };

  const drawJoint = (ctx, position, joint, angle, index) => {
    const radius = joint.radius * visualConfig.zoom;
    
    // Joint shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(position.x + 3, position.y + 3, radius + 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Joint body gradient
    const gradient = ctx.createRadialGradient(
      position.x - radius/3, position.y - radius/3, 0,
      position.x, position.y, radius
    );
    gradient.addColorStop(0, '#e2e8f0');
    gradient.addColorStop(1, joint.color);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Joint outline
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Angle indicator
    if (Math.abs(angle) > 0.1) {
      ctx.strokeStyle = '#fbb03b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius - 4, 0, angle);
      ctx.stroke();
    }
    
    // Joint label
    if (visualConfig.showJointLabels) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, 14 * visualConfig.zoom)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`J${index + 1}`, position.x, position.y + 5);
    }
    
    ctx.restore();
  };

  const drawEndEffector = (ctx, position, isAtTarget = false) => {
    const radius = robotConfig.endEffector.radius * visualConfig.zoom;
    
    // Glow effect if at target
    if (isAtTarget || showTargetReached) {
      ctx.save();
      ctx.shadowColor = '#48bb78';
      ctx.shadowBlur = 25 * visualConfig.zoom;
      ctx.fillStyle = '#48bb78';
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius + 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
    
    // End effector gradient
    const gradient = ctx.createRadialGradient(
      position.x - radius/3, position.y - radius/3, 0,
      position.x, position.y, radius
    );
    gradient.addColorStop(0, '#fed7aa');
    gradient.addColorStop(1, robotConfig.endEffector.color);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // End effector cross
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(position.x - radius/2, position.y);
    ctx.lineTo(position.x + radius/2, position.y);
    ctx.moveTo(position.x, position.y - radius/2);
    ctx.lineTo(position.x, position.y + radius/2);
    ctx.stroke();
    
    // Position coordinates
    if (visualConfig.showJointLabels) {
      ctx.fillStyle = '#2d3748';
      ctx.font = `${Math.max(8, 10 * visualConfig.zoom)}px Arial`;
      ctx.textAlign = 'center';
      const x = ((position.x - canvasRef.current.width/2 - visualConfig.centerX) / visualConfig.zoom).toFixed(0);
      const y = (-(position.y - canvasRef.current.height/2 - visualConfig.centerY) / visualConfig.zoom).toFixed(0);
      ctx.fillText(`(${x}, ${y})`, position.x, position.y + radius + 15);
    }
  };

  const drawTrajectory = (ctx, centerX, centerY) => {
    if (!visualConfig.showTrajectory || trajectoryRef.current.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    trajectoryRef.current.forEach((point, index) => {
      const x = centerX + point.x * visualConfig.zoom + visualConfig.centerX;
      const y = centerY - point.y * visualConfig.zoom + visualConfig.centerY;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw trajectory points
    trajectoryRef.current.forEach((point, index) => {
      if (index % 5 === 0) { // Every 5th point
        const x = centerX + point.x * visualConfig.zoom + visualConfig.centerX;
        const y = centerY - point.y * visualConfig.zoom + visualConfig.centerY;
        
        ctx.fillStyle = '#9f7aea';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    ctx.restore();
  };

  const drawTargetPosition = (ctx, centerX, centerY) => {
    if (!targetAngles) return;
    
    const targetPositions = calculateForwardKinematics(
      targetAngles.map(angle => angle * Math.PI / 180)
    );
    const targetEnd = targetPositions[targetPositions.length - 1];
    
    const x = centerX + targetEnd.x * visualConfig.zoom + visualConfig.centerX;
    const y = centerY - targetEnd.y * visualConfig.zoom + visualConfig.centerY;
    
    // Pulsing target marker
    const time = Date.now() * 0.005;
    const pulseRadius = (12 + Math.sin(time) * 4) * visualConfig.zoom;
    
    ctx.save();
    
    // Outer pulse
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius + 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Main target
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Target cross
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - pulseRadius/2, y);
    ctx.lineTo(x + pulseRadius/2, y);
    ctx.moveTo(x, y - pulseRadius/2);
    ctx.lineTo(x, y + pulseRadius/2);
    ctx.stroke();
    
    // Target label
    ctx.fillStyle = '#1a202c';
    ctx.font = `bold ${Math.max(10, 12 * visualConfig.zoom)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', x, y - pulseRadius - 10);
    
    ctx.restore();
  };

  // Main drawing function
  const drawRobot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2 + visualConfig.centerX;
    const centerY = canvas.height / 2 + visualConfig.centerY;
    
    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#f7fafc');
    bgGradient.addColorStop(1, '#edf2f7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw components in order
    drawGrid(ctx, canvas, centerX, centerY);
    drawWorkspace(ctx, centerX, centerY);
    drawTrajectory(ctx, centerX, centerY);
    drawCoordinateSystem(ctx, centerX, centerY);
    
    // Calculate robot positions
    const positions = calculateForwardKinematics(currentAngles);
    const screenPositions = positions.map(pos => ({
      x: centerX + pos.x * visualConfig.zoom,
      y: centerY - pos.y * visualConfig.zoom,
      angle: pos.angle
    }));
    
    // Draw robot components
    drawRobotBase(ctx, centerX, centerY);
    
    // Draw links
    for (let i = 0; i < robotConfig.links.length; i++) {
      drawLink(
        ctx,
        screenPositions[i],
        screenPositions[i + 1],
        robotConfig.links[i],
        i
      );
    }
    
    // Draw joints
    robotConfig.joints.forEach((joint, index) => {
      drawJoint(ctx, screenPositions[index], joint, currentAngles[index], index);
    });
    
    // Draw end effector
    const isAtTarget = targetAngles && 
      currentAngles.every((angle, i) => 
        Math.abs(angle - targetAngles[i] * Math.PI / 180) < 0.05
      );
    drawEndEffector(ctx, screenPositions[screenPositions.length - 1], isAtTarget);
    
    // Draw target position
    drawTargetPosition(ctx, centerX, centerY);
    
    // Draw status information
    drawStatusPanel(ctx, canvas);
    
  }, [currentAngles, targetAngles, visualConfig, calculateForwardKinematics, showTargetReached]);

  const drawStatusPanel = (ctx, canvas) => {
    ctx.save();
    
    // Status panel background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, 10, 220, 140);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 220, 140);
    
    // Status panel content
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Robot Status', 20, 30);
    
    ctx.font = '12px Arial';
    currentAngles.forEach((angle, i) => {
      const degrees = (angle * 180 / Math.PI).toFixed(1);
      const isWithinLimits = Math.abs(parseFloat(degrees)) <= robotConfig.joints[i].limits[1];
      
      ctx.fillStyle = isWithinLimits ? '#2d3748' : '#e53e3e';
      ctx.fillText(`Joint ${i + 1}: ${degrees}°`, 20, 50 + i * 18);
    });
    
    // End effector position
    const endPos = calculateForwardKinematics(currentAngles)[3];
    ctx.fillStyle = '#2d3748';
    ctx.fillText(`End Effector:`, 20, 110);
    ctx.fillText(`X: ${endPos.x.toFixed(1)} Y: ${endPos.y.toFixed(1)}`, 20, 125);
    
    // Performance info
    ctx.fillStyle = '#718096';
    ctx.font = '10px Arial';
    ctx.fillText(`Zoom: ${(visualConfig.zoom * 100).toFixed(0)}%`, 20, 140);
    
    ctx.restore();
  };

  // Update visualization when angles change
  useEffect(() => {
    drawRobot();
  }, [drawRobot]);

  // Handle mouse interactions
  const handleMouseWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setVisualConfig(prev => ({
      ...prev,
      zoom: Math.max(0.2, Math.min(3.0, prev.zoom * zoomFactor))
    }));
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Left mouse button
      const dx = e.movementX;
      const dy = e.movementY;
      setVisualConfig(prev => ({
        ...prev,
        centerX: prev.centerX + dx,
        centerY: prev.centerY + dy
      }));
    }
  };

  const resetView = () => {
    setVisualConfig(prev => ({
      ...prev,
      zoom: 1.0,
      centerX: 0,
      centerY: 0
    }));
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={450}
        onWheel={handleMouseWheel}
        onMouseMove={handleMouseMove}
        style={{
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          cursor: 'grab',
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          maxHeight: '450px'
        }}
        onMouseDown={(e) => {
          e.target.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.target.style.cursor = 'grab';
        }}
      />
      
      {/* Control Overlay */}
      <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        p: 1.5,
        borderRadius: 2,
        boxShadow: 2,
        minWidth: '200px'
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Visualization Controls
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={1}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={visualConfig.showWorkspace}
                onChange={(e) => setVisualConfig(prev => ({
                  ...prev,
                  showWorkspace: e.target.checked
                }))}
              />
            }
            label="Workspace"
            sx={{ fontSize: '12px' }}
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={visualConfig.showTrajectory}
                onChange={(e) => setVisualConfig(prev => ({
                  ...prev,
                  showTrajectory: e.target.checked
                }))}
              />
            }
            label="Trajectory"
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={visualConfig.showGrid}
                onChange={(e) => setVisualConfig(prev => ({
                  ...prev,
                  showGrid: e.target.checked
                }))}
              />
            }
            label="Grid"
          />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" gutterBottom>
              Animation Speed
            </Typography>
            <Slider
              size="small"
              value={visualConfig.animationSpeed}
              onChange={(e, value) => setVisualConfig(prev => ({
                ...prev,
                animationSpeed: value
              }))}
              min={0.01}
              max={0.2}
              step={0.01}
              sx={{ width: '100%' }}
            />
          </Box>
          
          <Box display="flex" gap={1} mt={1}>
            <Tooltip title="Reset View">
              <IconButton size="small" onClick={resetView}>
                <CenterFocusStrong fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Clear Trajectory">
              <IconButton size="small" onClick={clearTrajectory}>
                <Timeline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RobotVisualizer;