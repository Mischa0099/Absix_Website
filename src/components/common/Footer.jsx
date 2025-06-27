import React from 'react';
import { Box, Typography, Container, Grid, Link, Divider } from '@mui/material';
import { GitHub, School, Code, Email, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Aurora Rising
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Interactive robotics learning platform combining theoretical knowledge 
              with hands-on hardware control experience. Master robot kinematics 
              through real-world challenges.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built for students, by robotics enthusiasts.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="text.secondary" underline="hover">
                Home
              </Link>
              <Link href="/dashboard" color="text.secondary" underline="hover">
                Dashboard
              </Link>
              <Link href="/leaderboard" color="text.secondary" underline="hover">
                Leaderboard
              </Link>
              <Link href="/profile" color="text.secondary" underline="hover">
                Profile
              </Link>
              <Link href="/help" color="text.secondary" underline="hover">
                Help & Support
              </Link>
            </Box>
          </Grid>

          {/* Resources & Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Resources & Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" />
                <Link href="/docs" color="text.secondary" underline="hover">
                  Learning Materials
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code fontSize="small" />
                <Link href="/api-docs" color="text.secondary" underline="hover">
                  API Documentation
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHub fontSize="small" />
                <Link href="https://github.com/robotics-course" color="text.secondary" underline="hover">
                  Source Code
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Link href="mailto:support@aurorarising.edu" color="text.secondary" underline="hover">
                  Contact Support
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Copyright & Legal */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Aurora Rising - Robotics Summer School. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" variant="body2" color="text.secondary" underline="hover">
              Privacy Policy
            </Link>
            <Link href="/terms" variant="body2" color="text.secondary" underline="hover">
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;