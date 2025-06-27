import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Tab, 
  Tabs,
  Divider 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../../store/authSlice';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const [tab, setTab] = useState(0);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: '',
    display_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (tab === 0) {
      // Login
      dispatch(loginUser({
        username: credentials.username,
        password: credentials.password
      }));
    } else {
      // Register
      dispatch(registerUser(credentials));
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 450, width: '100%' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Welcome to Aurora Rising
        </Typography>
        
        <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            margin="normal"
            required
          />
          
          {tab === 1 && (
            <>
              <TextField
                fullWidth
                label="Display Name"
                value={credentials.display_name}
                onChange={(e) => setCredentials({...credentials, display_name: e.target.value})}
                margin="normal"
                helperText="How your name will appear to others"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                margin="normal"
                required={tab === 1}
              />
            </>
          )}
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Please wait...' : (tab === 0 ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Demo Credentials:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Username: <strong>student1</strong> | Password: <strong>password</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Username: <strong>admin</strong> | Password: <strong>admin</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;