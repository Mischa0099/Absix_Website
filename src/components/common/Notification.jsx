import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Slide, 
  IconButton,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';

const Notification = ({ 
  open, 
  message, 
  severity = 'info', 
  duration = 6000, 
  onClose,
  position = { vertical: 'bottom', horizontal: 'left' },
  action = null
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const SlideTransition = (props) => {
    return <Slide {...props} direction="up" />;
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert 
        severity={severity} 
        onClose={handleClose}
        action={
          action || (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close fontSize="small" />
            </IconButton>
          )
        }
        sx={{ minWidth: 300 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Notification hook for easy usage
export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message, severity = 'info', duration = 6000) => {
    setNotification({
      open: true,
      message,
      severity,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};

export default Notification;
