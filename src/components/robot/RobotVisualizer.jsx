import React, { useRef, useEffect } from 'react';

const RobotVisualizer = ({ 
  currentAngles = [0, 0, 0], 
  targetAngles = null, 
  showTarget = false,
  className = "",
  width = 400,
  height = 300
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const linkLengths = [80, 56, 40];
    const baseX = canvas.width / 2;
    const baseY = canvas.height - 50;

    ctx.fillStyle = '#444444';
    ctx.fillRect(baseX - 20, baseY, 40, 20);

    if (showTarget && targetAngles) {
      drawArm(ctx, baseX, baseY, targetAngles, linkLengths, true);
    }

    drawArm(ctx, baseX, baseY, currentAngles, linkLengths, false);

  }, [currentAngles, targetAngles, showTarget, width, height]);

  const drawArm = (ctx, baseX, baseY, angles, linkLengths, isTarget) => {
    const colors = isTarget 
      ? ['rgba(255, 183, 77, 0.6)', 'rgba(255, 167, 38, 0.6)', 'rgba(255, 152, 0, 0.6)']
      : ['#64B5F6', '#42A5F5', '#2196F3'];
    
    const jointColors = isTarget
      ? ['rgba(251, 140, 0, 0.6)', 'rgba(245, 124, 0, 0.6)', 'rgba(239, 108, 0, 0.6)']
      : ['#1E88E5', '#1976D2', '#1565C0'];

    const lineWidth = isTarget ? 2 : 3;
    const jointRadius = isTarget ? 6 : 8;

    const angleRad = angles.map(angle => angle * Math.PI / 180);
    const positions = [[baseX, baseY]];

    let currentAngle = 0;
    for (let i = 0; i < 3; i++) {
      currentAngle += angleRad[i];
      const x = positions[i][0] + linkLengths[i] * Math.cos(currentAngle);
      const y = positions[i][1] - linkLengths[i] * Math.sin(currentAngle);
      positions.push([x, y]);
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(positions[i][0], positions[i][1]);
      ctx.lineTo(positions[i + 1][0], positions[i + 1][1]);
      ctx.stroke();

      ctx.fillStyle = jointColors[i];
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(positions[i][0], positions[i][1], jointRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = jointColors[2];
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(positions[3][0], positions[3][1], jointRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default RobotVisualizer;