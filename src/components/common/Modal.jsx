import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';

const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  actions = null,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  closeOnBackdropClick = true
}) => {
  const handleClose = (event, reason) => {
    if (!closeOnBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper'
        }
      }}
    >
      {title && (
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ p: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
