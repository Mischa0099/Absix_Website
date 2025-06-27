/* =================== themes.js =================== */
import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  primary: {
    main: '#0cc0df',
    light: '#4dd3e8',
    dark: '#0099b8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#007acc',
    light: '#339cdd',
    dark: '#005599',
    contrastText: '#ffffff',
  },
  background: {
    default: '#000814',
    paper: '#1a1a1a',
    surface: '#2a2a2a',
    elevated: '#3a3a3a',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },
  error: {
    main: '#f44336',
    light: '#f77066',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  difficulty: {
    beginner: '#4caf50',
    intermediate: '#ff9800',
    advanced: '#f44336',
    expert: '#9c27b0',
  },
  robot: {
    online: '#4caf50',
    offline: '#f44336',
    moving: '#ff9800',
    error: '#f44336',
  },
};

// Common Theme Options
const commonOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    code: {
      fontFamily: [
        '"Fira Code"',
        '"SF Mono"',
        'Monaco',
        'Inconsolata',
        '"Roboto Mono"',
        '"Source Code Pro"',
        'monospace',
      ].join(','),
      fontSize: '0.875em',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '0.2em 0.4em',
      borderRadius: '4px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 6px 12px rgba(0, 0, 0, 0.15)',
    '0px 8px 16px rgba(0, 0, 0, 0.18)',
    '0px 12px 24px rgba(0, 0, 0, 0.2)',
    '0px 16px 32px rgba(0, 0, 0, 0.22)',
    '0px 20px 40px rgba(0, 0, 0, 0.25)',
    '0px 24px 48px rgba(0, 0, 0, 0.28)',
    '0px 32px 64px rgba(0, 0, 0, 0.3)',
    // Glow shadows for robotics theme
    '0px 0px 20px rgba(12, 192, 223, 0.3)',
    '0px 0px 30px rgba(12, 192, 223, 0.4)',
    '0px 0px 40px rgba(12, 192, 223, 0.5)',
    '0px 4px 20px rgba(12, 192, 223, 0.3)',
    '0px 8px 30px rgba(12, 192, 223, 0.4)',
    '0px 12px 40px rgba(12, 192, 223, 0.5)',
    '0px 16px 50px rgba(12, 192, 223, 0.6)',
    '0px 20px 60px rgba(12, 192, 223, 0.7)',
    '0px 24px 70px rgba(12, 192, 223, 0.8)',
    '0px 32px 80px rgba(12, 192, 223, 0.9)',
    '0px 40px 90px rgba(12, 192, 223, 1.0)',
    '0px 48px 100px rgba(12, 192, 223, 1.0)',
    '0px 56px 110px rgba(12, 192, 223, 1.0)',
    '0px 64px 120px rgba(12, 192, 223, 1.0)',
    '0px 72px 130px rgba(12, 192, 223, 1.0)',
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

// Dark Theme (Primary)
export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    ...colors,
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: 'rgba(255, 255, 255, 0.56)',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#0cc0df #1a1a1a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#1a1a1a',
            width: 12,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#0cc0df',
            minHeight: 24,
            border: '2px solid #1a1a1a',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#007acc',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#007acc',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#007acc',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(12, 192, 223, 0.3)',
          },
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #0cc0df, #007acc)',
          '&:hover': {
            background: 'linear-gradient(135deg, #007acc, #0099cc)',
          },
        },
        outlined: {
          borderColor: '#0cc0df',
          color: '#0cc0df',
          '&:hover': {
            borderColor: '#007acc',
            backgroundColor: 'rgba(12, 192, 223, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(12, 192, 223, 0.2)',
            borderColor: 'rgba(12, 192, 223, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0cc0df',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0cc0df',
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#0cc0df',
          '& .MuiSlider-track': {
            background: 'linear-gradient(90deg, #0cc0df, #007acc)',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#0cc0df',
            boxShadow: '0 0 10px rgba(12, 192, 223, 0.5)',
            '&:hover': {
              boxShadow: '0 0 15px rgba(12, 192, 223, 0.7)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
        },
        bar: {
          background: 'linear-gradient(90deg, #0cc0df, #007acc)',
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#0cc0df',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(12, 192, 223, 0.2)',
          border: '1px solid rgba(12, 192, 223, 0.5)',
          color: '#0cc0df',
          '&:hover': {
            backgroundColor: 'rgba(12, 192, 223, 0.3)',
          },
        },
        filled: {
          backgroundColor: '#0cc0df',
          color: '#000814',
          '&:hover': {
            backgroundColor: '#007acc',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: '#f44336',
          color: '#f44336',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: '#ff9800',
          color: '#ff9800',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: '#2196f3',
          color: '#2196f3',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: '#4caf50',
          color: '#4caf50',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0cc0df, #007acc)',
          boxShadow: '0 4px 20px rgba(12, 192, 223, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
        },
        arrow: {
          color: 'rgba(26, 26, 26, 0.95)',
        },
      },
    },
  },
});

// Light Theme (Alternative)
export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
});

// High Contrast Theme (Accessibility)
export const highContrastTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ffff00',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
      disabled: '#cccccc',
    },
    error: {
      main: '#ff0000',
    },
    warning: {
      main: '#ffff00',
    },
    info: {
      main: '#00ffff',
    },
    success: {
      main: '#00ff00',
    },
    divider: '#ffffff',
  },
});

// Theme Variants
export const themeVariants = {
  dark: darkTheme,
  light: lightTheme,
  highContrast: highContrastTheme,
};

// Default Theme
export default darkTheme;