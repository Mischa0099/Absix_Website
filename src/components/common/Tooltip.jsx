// =================== Tooltip.jsx ===================
import React from 'react';
import { Tooltip as MuiTooltip, Zoom } from '@mui/material';

const Tooltip = ({ 
  title, 
  children, 
  placement = 'top',
  arrow = true,
  delay = [500, 0], // [open, close] delay in ms
  interactive = false
}) => {
  if (!title) {
    return children;
  }

  return (
    <MuiTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={delay[0]}
      leaveDelay={delay[1]}
      interactive={interactive}
      TransitionComponent={Zoom}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'grey.800',
            color: 'white',
            fontSize: '0.75rem',
            maxWidth: 300,
            '& .MuiTooltip-arrow': {
              color: 'grey.800',
            },
          },
        },
      }}
    >
      <span>{children}</span>
    </MuiTooltip>
  );
};

export default Tooltip;