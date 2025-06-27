// // =================== ConnectionStatus.jsx ===================
// import React, { useState, useEffect } from 'react';
// import { 
//   Box, 
//   Card, 
//   CardContent, 
//   Typography, 
//   Grid,
//   Fade
// } from '@mui/material';
// import StatusIndicator from './StatusIndicator';
// import { useSelector } from 'react-redux';

// const ConnectionStatus = ({ 
//   showDetails = true,
//   compact = false,
//   realTimeUpdates = true
// }) => {
//   const [lastUpdate, setLastUpdate] = useState(new Date());
//   const { connected: robotConnected, connectionStatus, bridgeStatus } = useSelector(state => state.robot || {});
//   const { isAuthenticated } = useSelector(state => state.auth);

//   useEffect(() => {
//     if (realTimeUpdates) {
//       const interval = setInterval(() => {
//         setLastUpdate(new Date());
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [realTimeUpdates]);

//   const getStatusColor = () => {
//     switch (connectionStatus) {
//       case 'connected':
//         return '#4CAF50'; // Green
//       case 'connecting':
//         return '#FF9800'; // Orange
//       case 'error':
//         return '#F44336'; // Red
//       default:
//         return '#757575'; // Gray
//     }
//   };

//   const getStatusText = () => {
//     switch (connectionStatus) {
//       case 'connected':
//         return 'Robot Connected';
//       case 'connecting':
//         return 'Connecting...';
//       case 'error':
//         return 'Connection Error';
//       default:
//         return 'Robot Disconnected';
//     }
//   };

//   const getStatusIcon = () => {
//     switch (connectionStatus) {
//       case 'connected':
//         return '🟢';
//       case 'connecting':
//         return '🟡';
//       case 'error':
//         return '🔴';
//       default:
//         return '⚫';
//     }
//   };


//   // Mock connection data - in real app, this would come from Redux/WebSocket
//   const connectionData = {
//     websocket: {
//       status: isAuthenticated ? 'connected' : 'disconnected',
//       latency: 45,
//       lastPing: new Date(Date.now() - 1000)
//     },
//     robot: {
//       status: robotConnected ? 'online' : 'offline',
//       firmware: '2.1.4',
//       lastHeartbeat: new Date(Date.now() - 2000)
//     },
//     bridge: {
//       status: bridgeStatus || 'offline',
//       version: '1.3.2',
//       uptime: '2h 34m'
//     }
//   };

//   if (compact) {
//     return (
//       <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
//         <StatusIndicator 
//           status={connectionData.websocket.status} 
//           type="connection"
//           variant="dot"
//           size="small"
//           label="WebSocket"
//         />
//         <StatusIndicator 
//           status={connectionData.robot.status} 
//           type="robot"
//           variant="dot" 
//           size="small"
//           label="Robot"
//         />
//       </Box>
//     );
//   }

//   return (
    
//       <Card variant="outlined" sx={{ mb: 2 }}>
//         <CardContent sx={{ pb: 2 }}>
//           <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             🔌 System Status
//             <Typography variant="caption" color="text.secondary">
//               Last updated: {lastUpdate.toLocaleTimeString()}
//             </Typography>
//           </Typography>
          
//           <Grid container spacing={2}>
//             {/* WebSocket Connection */}
//             <Grid item xs={12} md={4}>
//               <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
//                 <Typography variant="subtitle2" gutterBottom>
//                   WebSocket Connection
//                 </Typography>
//                 <StatusIndicator 
//                   status={connectionData.websocket.status} 
//                   type="connection"
//                   variant="chip"
//                   size="small"
//                 />
//                 {showDetails && (
//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Latency: {connectionData.websocket.latency}ms
//                     </Typography>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Last ping: {connectionData.websocket.lastPing.toLocaleTimeString()}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Grid>

//             {/* Robot Status */}
//             <Grid item xs={12} md={4}>
//               <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
//                 <Typography variant="subtitle2" gutterBottom>
//                   Robot Hardware
//                 </Typography>
//                 <StatusIndicator 
//                   status={connectionData.robot.status} 
//                   type="robot"
//                   variant="chip"
//                   size="small"
//                 />
//                 {showDetails && (
//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Firmware: v{connectionData.robot.firmware}
//                     </Typography>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Heartbeat: {connectionData.robot.lastHeartbeat.toLocaleTimeString()}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//             <div className={`flex items-center gap-2 ${className}`}>
//       <span>{getStatusIcon()}</span>
//       <span 
//         className="text-sm font-medium"
//         style={{ color: getStatusColor() }}
//       >
//         {getStatusText()}
//       </span>
//     </div>

//             {/* Bridge Status */}
//             <Grid item xs={12} md={4}>
//               <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
//                 <Typography variant="subtitle2" gutterBottom>
//                   Communication Bridge
//                 </Typography>
//                 <StatusIndicator 
//                   status={connectionData.bridge.status} 
//                   type="connection"
//                   variant="chip"
//                   size="small"
//                 />
//                 {showDetails && (
//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Version: v{connectionData.bridge.version}
//                     </Typography>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       Uptime: {connectionData.bridge.uptime}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//           </Grid>

//           {/* System Health Summary */}
//           {showDetails && (
//             <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
//               <Typography variant="body2" color="text.secondary">
//                 <strong>System Health:</strong> All systems operational. Robot control interface ready for commands.
//               </Typography>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//   );
// };

// export default ConnectionStatus;

import React from 'react';
import { useSelector } from 'react-redux';

const ConnectionStatus = ({ className = "" }) => {
  const { connected, connectionStatus } = useSelector(state => state.robot);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50'; // Green
      case 'connecting':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Robot Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Robot Disconnected';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚫';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{getStatusIcon()}</span>
      <span 
        className="text-sm font-medium"
        style={{ color: getStatusColor() }}
      >
        {getStatusText()}
      </span>
    </div>
  );
};

export default ConnectionStatus;