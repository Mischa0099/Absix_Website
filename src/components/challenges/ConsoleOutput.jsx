import React, { useRef, useEffect, useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem, 
  Chip, 
  Tooltip,
  Badge,
  Divider,
  Button
} from '@mui/material';
import { 
  Clear, 
  FilterList, 
  Download, 
  Search, 
  ExpandMore, 
  ExpandLess,
  Terminal,
  BugReport,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';

const ConsoleOutput = ({ 
  messages = [], 
  onClear, 
  height = '300px',
  enableFiltering = true,
  enableExport = false,
  maxMessages = 100
}) => {
  const consoleRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (consoleRef.current && isExpanded) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  // Message type utilities
  const getMessageType = (message) => {
    if (typeof message === 'string') {
      const text = message.toLowerCase();
      if (text.includes('error') || text.includes('failed') || text.includes('❌')) return 'error';
      if (text.includes('success') || text.includes('completed') || text.includes('✅')) return 'success';
      if (text.includes('warning') || text.includes('⚠️')) return 'warning';
      return 'info';
    }
    return message.type || 'info';
  };

  const getMessageIcon = (type) => {
    const iconProps = { fontSize: 'small', sx: { mr: 1 } };
    switch (type) {
      case 'error': return <ErrorIcon color="error" {...iconProps} />;
      case 'success': return <CheckCircle color="success" {...iconProps} />;
      case 'warning': return <Warning color="warning" {...iconProps} />;
      default: return <Info color="info" {...iconProps} />;
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'error': return '#f56565';
      case 'success': return '#48bb78';
      case 'warning': return '#ed8936';
      default: return '#68d391';
    }
  };

  // Filter messages
  const filteredMessages = messages
    .filter(msg => {
      const msgType = getMessageType(msg.message || msg);
      if (filter !== 'all' && msgType !== filter) return false;
      
      if (searchTerm) {
        const text = (msg.message || msg).toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      }
      
      return true;
    })
    .slice(-maxMessages); // Limit number of messages

  // Count messages by type
  const messageCounts = messages.reduce((counts, msg) => {
    const type = getMessageType(msg.message || msg);
    counts[type] = (counts[type] || 0) + 1;
    counts.total = (counts.total || 0) + 1;
    return counts;
  }, {});

  // Handle filter menu
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filterType) => {
    setFilter(filterType);
    handleFilterClose();
  };

  // Export console log
  const handleExport = () => {
    const consoleData = messages.map(msg => {
      const timestamp = msg.timestamp || new Date().toISOString();
      const message = msg.message || msg;
      const type = getMessageType(message);
      return `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    }).join('\n');

    const blob = new Blob([consoleData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot_console_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box sx={{ 
      bgcolor: '#0d1117', 
      borderRadius: 2, 
      overflow: 'hidden',
      border: '1px solid #30363d',
      height: height
    }}>
      {/* Console Header */}
      <Box sx={{ 
        bgcolor: '#161b22', 
        px: 2, 
        py: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #30363d'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Terminal sx={{ color: '#7c3aed', fontSize: '18px' }} />
          <Typography variant="subtitle2" sx={{ color: '#f0f6fc', fontWeight: 'bold' }}>
            System Console
          </Typography>
          <Box display="flex" gap={0.5}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#ff5f56', borderRadius: '50%' }} />
            <Box sx={{ width: 12, height: 12, bgcolor: '#ffbd2e', borderRadius: '50%' }} />
            <Box sx={{ width: 12, height: 12, bgcolor: '#27ca3f', borderRadius: '50%' }} />
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {/* Message counts */}
          <Box display="flex" gap={0.5}>
            <Chip 
              label={messageCounts.total || 0}
              size="small"
              sx={{ 
                bgcolor: '#30363d', 
                color: '#f0f6fc',
                fontSize: '10px',
                height: '20px'
              }}
            />
            {messageCounts.error > 0 && (
              <Chip 
                label={messageCounts.error}
                size="small"
                color="error"
                sx={{ fontSize: '10px', height: '20px' }}
              />
            )}
            {messageCounts.warning > 0 && (
              <Chip 
                label={messageCounts.warning}
                size="small"
                color="warning"
                sx={{ fontSize: '10px', height: '20px' }}
              />
            )}
          </Box>

          {/* Filter dropdown */}
          {enableFiltering && (
            <Tooltip title="Filter messages">
              <IconButton 
                size="small" 
                onClick={handleFilterClick}
                sx={{ color: '#8b949e' }}
              >
                <Badge 
                  badgeContent={filter !== 'all' ? '!' : null} 
                  color="primary"
                  variant="dot"
                >
                  <FilterList fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Export button */}
          {enableExport && (
            <Tooltip title="Export console log">
              <IconButton 
                size="small" 
                onClick={handleExport}
                sx={{ color: '#8b949e' }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Clear button */}
          <Tooltip title="Clear console">
            <IconButton 
              size="small" 
              onClick={onClear}
              sx={{ color: '#8b949e' }}
            >
              <Clear fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Expand/Collapse */}
          <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
            <IconButton 
              size="small" 
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: '#8b949e' }}
            >
              {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { bgcolor: '#161b22', border: '1px solid #30363d' }
        }}
      >
        <MenuItem 
          onClick={() => handleFilterSelect('all')}
          selected={filter === 'all'}
          sx={{ color: '#f0f6fc' }}
        >
          <Info fontSize="small" sx={{ mr: 1 }} />
          All Messages ({messageCounts.total || 0})
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterSelect('info')}
          selected={filter === 'info'}
          sx={{ color: '#58a6ff' }}
        >
          <Info fontSize="small" sx={{ mr: 1 }} />
          Info ({messageCounts.info || 0})
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterSelect('success')}
          selected={filter === 'success'}
          sx={{ color: '#3fb950' }}
        >
          <CheckCircle fontSize="small" sx={{ mr: 1 }} />
          Success ({messageCounts.success || 0})
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterSelect('warning')}
          selected={filter === 'warning'}
          sx={{ color: '#d29922' }}
        >
          <Warning fontSize="small" sx={{ mr: 1 }} />
          Warnings ({messageCounts.warning || 0})
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterSelect('error')}
          selected={filter === 'error'}
          sx={{ color: '#f85149' }}
        >
          <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
          Errors ({messageCounts.error || 0})
        </MenuItem>
      </Menu>

      {/* Console Content */}
      {isExpanded && (
        <Box sx={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
          {/* Search bar */}
          {enableFiltering && (
            <Box sx={{ p: 1, borderBottom: '1px solid #30363d' }}>
              <input
                type="text"
                placeholder="Search console output..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </Box>
          )}

          {/* Messages container */}
          <Box 
            ref={consoleRef}
            sx={{ 
              flex: 1,
              overflow: 'auto',
              p: 1,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '12px',
              lineHeight: 1.4
            }}
          >
            {filteredMessages.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                color: '#8b949e',
                fontStyle: 'italic'
              }}>
                {searchTerm ? 'No messages match your search' : 'No console output to display'}
              </Box>
            ) : (
              filteredMessages.map((msg, index) => {
                const messageText = msg.message || msg;
                const messageType = getMessageType(messageText);
                const timestamp = msg.timestamp || new Date().toLocaleTimeString();
                
                return (
                  <Box 
                    key={msg.id || index}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'rgba(240, 246, 252, 0.03)'
                      },
                      borderLeft: `3px solid ${getMessageColor(messageType)}`,
                      marginLeft: '4px',
                      marginBottom: '2px'
                    }}
                  >
                    {/* Timestamp */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#8b949e',
                        minWidth: '70px',
                        fontSize: '10px',
                        fontFamily: 'inherit'
                      }}
                    >
                      {formatTimestamp(timestamp)}
                    </Typography>

                    {/* Message type icon */}
                    <Box sx={{ mt: 0.25 }}>
                      {getMessageIcon(messageType)}
                    </Box>

                    {/* Message content */}
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: getMessageColor(messageType),
                        fontFamily: 'inherit',
                        fontSize: '12px',
                        flex: 1,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {messageText}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>

          {/* Status bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'between', 
            alignItems: 'center',
            px: 2,
            py: 0.5,
            bgcolor: '#161b22',
            borderTop: '1px solid #30363d',
            fontSize: '10px'
          }}>
            <Typography variant="caption" sx={{ color: '#8b949e' }}>
              {filteredMessages.length} of {messages.length} messages
              {filter !== 'all' && ` (filtered by ${filter})`}
              {searchTerm && ` (search: "${searchTerm}")`}
            </Typography>
            
            <Typography variant="caption" sx={{ color: '#8b949e' }}>
              Last update: {messages.length > 0 ? formatTimestamp(messages[messages.length - 1].timestamp) : 'Never'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Minimized state */}
      {!isExpanded && (
        <Box sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          color: '#8b949e'
        }}>
          <Typography variant="caption">
            Console minimized - {messages.length} messages
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConsoleOutput;