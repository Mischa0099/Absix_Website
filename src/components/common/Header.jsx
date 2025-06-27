// // src/components/common/Header.jsx
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Box,
//   IconButton,
//   Menu,
//   MenuItem,
//   Avatar,
//   Chip,
//   Badge,
//   Tooltip,
//   useMediaQuery,
//   useTheme,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Divider
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   AccountCircle,
//   Logout,
//   Dashboard,
//   EmojiEvents,
//   Person,
//   Settings,
//   Notifications,
//   Home,
//   School,
//   SmartToy,
//   Close
// } from '@mui/icons-material';
// import { logoutUser } from '../../store/authSlice';
// import { getRank } from '../../utils/helpers';

// // Animated Logo Component
// const AnimatedLogo = () => {
//   return (
//     <motion.div
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: '12px',
//         cursor: 'pointer'
//       }}
//       whileHover={{ scale: 1.05 }}
//       transition={{ duration: 0.2 }}
//     >
//       <motion.div
//         animate={{ 
//           rotate: [0, 360],
//           scale: [1, 1.1, 1]
//         }}
//         transition={{ 
//           rotate: { duration: 20, repeat: Infinity, ease: "linear" },
//           scale: { duration: 2, repeat: Infinity, repeatDelay: 3 }
//         }}
//       >
//         <SmartToy 
//           sx={{ 
//             fontSize: 40, 
//             color: '#0cc0df',
//             filter: 'drop-shadow(0 0 10px rgba(12, 192, 223, 0.5))'
//           }} 
//         />
//       </motion.div>
//       <Box>
//         <Typography 
//           variant="h6" 
//           sx={{ 
//             fontWeight: 'bold',
//             background: 'linear-gradient(45deg, #0cc0df, #ffd60a)',
//             backgroundClip: 'text',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             fontSize: '1.4rem'
//           }}
//         >
//           Aurora Rising
//         </Typography>
//         <Typography 
//           variant="caption" 
//           sx={{ 
//             color: 'rgba(168, 218, 220, 0.8)',
//             fontSize: '0.7rem',
//             display: 'block',
//             lineHeight: 1
//           }}
//         >
//           Robotics Summer School
//         </Typography>
//       </Box>
//     </motion.div>
//   );
// };

// // Navigation Menu Component
// const NavigationMenu = ({ isMobile = false, onClose = null }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const menuItems = [
//     { label: 'Dashboard', icon: Dashboard, path: '/dashboard' },
//     { label: 'Challenges', icon: School, path: '/challenges' },
//     { label: 'Leaderboard', icon: EmojiEvents, path: '/leaderboard' },
//     { label: 'Profile', icon: Person, path: '/profile' }
//   ];

//   const handleNavigation = (path) => {
//     navigate(path);
//     if (onClose) onClose();
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: { opacity: 1, x: 0 }
//   };

//   if (isMobile) {
//     return (
//       <List sx={{ width: 280, pt: 2 }}>
//         {menuItems.map((item, index) => {
//           const isActive = location.pathname === item.path;
//           const Icon = item.icon;
          
//           return (
//             <motion.div
//               key={item.path}
//               variants={itemVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: index * 0.1 }}
//             >
//               <ListItem 
//                 button 
//                 onClick={() => handleNavigation(item.path)}
//                 sx={{
//                   mx: 1,
//                   mb: 1,
//                   borderRadius: '12px',
//                   bgcolor: isActive ? 'rgba(12, 192, 223, 0.2)' : 'transparent',
//                   border: isActive ? '1px solid rgba(12, 192, 223, 0.5)' : '1px solid transparent',
//                   '&:hover': {
//                     bgcolor: 'rgba(12, 192, 223, 0.1)',
//                     borderColor: 'rgba(12, 192, 223, 0.3)'
//                   }
//                 }}
//               >
//                 <ListItemIcon>
//                   <Icon sx={{ color: isActive ? '#0cc0df' : 'rgba(255, 255, 255, 0.7)' }} />
//                 </ListItemIcon>
//                 <ListItemText 
//                   primary={item.label}
//                   sx={{
//                     '& .MuiListItemText-primary': {
//                       color: isActive ? '#0cc0df' : 'rgba(255, 255, 255, 0.9)',
//                       fontWeight: isActive ? 'bold' : 'normal'
//                     }
//                   }}
//                 />
//               </ListItem>
//             </motion.div>
//           );
//         })}
//       </List>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', gap: 1 }}>
//       {menuItems.map((item) => {
//         const isActive = location.pathname === item.path;
//         const Icon = item.icon;
        
//         return (
//           <motion.div
//             key={item.path}
//             whileHover={{ y: -2 }}
//             whileTap={{ y: 0 }}
//           >
//             <Button
//               startIcon={<Icon />}
//               onClick={() => handleNavigation(item.path)}
//               sx={{
//                 color: isActive ? '#0cc0df' : 'rgba(255, 255, 255, 0.8)',
//                 bgcolor: isActive ? 'rgba(12, 192, 223, 0.1)' : 'transparent',
//                 border: isActive ? '1px solid rgba(12, 192, 223, 0.3)' : '1px solid transparent',
//                 borderRadius: '10px',
//                 px: 2,
//                 py: 1,
//                 fontWeight: isActive ? 'bold' : 'normal',
//                 '&:hover': {
//                   bgcolor: 'rgba(12, 192, 223, 0.1)',
//                   borderColor: 'rgba(12, 192, 223, 0.3)',
//                   color: '#0cc0df'
//                 }
//               }}
//             >
//               {item.label}
//             </Button>
//           </motion.div>
//         );
//       })}
//     </Box>
//   );
// };

// // User Profile Menu
// const UserProfileMenu = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector(state => state.auth);
//   const { userProgress } = useSelector(state => state.challenges);
  
//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);
  
//   const userRank = getRank(userProgress?.challengesCompleted || 0, userProgress?.totalScore || 0);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//   dispatch(logoutUser());  // ✅ Correct action name
//   navigate('/');
//   handleClose();
// };

//   const handleProfile = () => {
//     navigate('/profile');
//     handleClose();
//   };

//   return (
//     <>
//       <motion.div
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//       >
//         <Tooltip title="Profile & Settings">
//           <IconButton
//             onClick={handleClick}
//             sx={{
//               p: 0,
//               border: '2px solid transparent',
//               '&:hover': {
//                 borderColor: 'rgba(12, 192, 223, 0.5)'
//               }
//             }}
//           >
//             <Avatar
//               sx={{
//                 width: 40,
//                 height: 40,
//                 bgcolor: 'linear-gradient(45deg, #0cc0df, #007acc)',
//                 fontSize: '1.2rem',
//                 fontWeight: 'bold'
//               }}
//             >
//               {user?.username?.[0]?.toUpperCase() || 'U'}
//             </Avatar>
//           </IconButton>
//         </Tooltip>
//       </motion.div>

//       <Menu
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         PaperProps={{
//           sx: {
//             bgcolor: 'rgba(0, 8, 20, 0.95)',
//             backdropFilter: 'blur(20px)',
//             border: '1px solid rgba(12, 192, 223, 0.3)',
//             borderRadius: '12px',
//             color: 'white',
//             minWidth: 250,
//             mt: 1
//           }
//         }}
//         transformOrigin={{ horizontal: 'right', vertical: 'top' }}
//         anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//       >
//         <Box sx={{ p: 2, borderBottom: '1px solid rgba(12, 192, 223, 0.2)' }}>
//           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
//             {user?.username || 'Student'}
//           </Typography>
//           <Typography variant="caption" color="rgba(168, 218, 220, 0.8)">
//             {user?.email}
//           </Typography>
//           <Box sx={{ mt: 1 }}>
//             <Chip
//               label={userRank}
//               size="small"
//               sx={{
//                 background: 'linear-gradient(45deg, #0cc0df, #ffd60a)',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 fontSize: '0.7rem'
//               }}
//             />
//           </Box>
//         </Box>

//         <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
//           <Person sx={{ mr: 2, color: '#0cc0df' }} />
//           <Typography>Profile</Typography>
//         </MenuItem>

//         <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
//           <Settings sx={{ mr: 2, color: '#0cc0df' }} />
//           <Typography>Settings</Typography>
//         </MenuItem>

//         <Divider sx={{ borderColor: 'rgba(12, 192, 223, 0.2)' }} />

//         <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#ff6b6b' }}>
//           <Logout sx={{ mr: 2 }} />
//           <Typography>Logout</Typography>
//         </MenuItem>
//       </Menu>
//     </>
//   );
// };

// // Score Display Component
// const ScoreDisplay = () => {
//   const { userProgress } = useSelector(state => state.challenges);
//   const [animatedScore, setAnimatedScore] = useState(0);

//   useEffect(() => {
//     const targetScore = userProgress?.totalScore || 0;
//     const duration = 1500;
//     const steps = 60;
//     const stepDuration = duration / steps;
    
//     let step = 0;
//     const interval = setInterval(() => {
//       step++;
//       const progress = step / steps;
//       const easeOut = 1 - Math.pow(1 - progress, 3);
//       setAnimatedScore(Math.floor(targetScore * easeOut));
      
//       if (step >= steps) {
//         clearInterval(interval);
//         setAnimatedScore(targetScore);
//       }
//     }, stepDuration);

//     return () => clearInterval(interval);
//   }, [userProgress?.totalScore]);

//   return (
//     <motion.div
//       whileHover={{ scale: 1.05 }}
//       transition={{ duration: 0.2 }}
//     >
//       <Tooltip title="Total Score">
//         <Chip
//           icon={<EmojiEvents />}
//           label={`${animatedScore} pts`}
//           sx={{
//             background: 'linear-gradient(45deg, #ffd60a, #ffba08)',
//             color: 'white',
//             fontWeight: 'bold',
//             fontSize: '0.9rem',
//             px: 1,
//             boxShadow: '0 4px 15px rgba(255, 214, 10, 0.3)',
//             '&:hover': {
//               boxShadow: '0 6px 20px rgba(255, 214, 10, 0.4)'
//             }
//           }}
//         />
//       </Tooltip>
//     </motion.div>
//   );
// };

// // Main Header Component
// const Header = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector(state => state.auth);
  
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const handleLogoClick = () => {
//     navigate(isAuthenticated ? '/dashboard' : '/');
//   };

//   if (!isAuthenticated) {
//     return null; // Don't show header on login/register pages
//   }

//   return (
//     <motion.div
//       initial={{ y: -100, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//     >
//       <AppBar 
//         position="sticky" 
//         sx={{
//           bgcolor: 'rgba(0, 8, 20, 0.95)',
//           backdropFilter: 'blur(20px)',
//           borderBottom: '1px solid rgba(12, 192, 223, 0.3)',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
//         }}
//       >
//         <Toolbar sx={{ py: 1 }}>
//           {/* Logo */}
//           <Box onClick={handleLogoClick} sx={{ mr: 4 }}>
//             <AnimatedLogo />
//           </Box>

//           {/* Desktop Navigation */}
//           {!isMobile && (
//             <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
//               <NavigationMenu />
//             </Box>
//           )}

//           {/* Right Side Actions */}
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
//             {/* Score Display */}
//             <ScoreDisplay />

//             {/* Notifications */}
//             <motion.div
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//             >
//               <Tooltip title="Notifications">
//                 <IconButton sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
//                   <Badge badgeContent={2} color="error">
//                     <Notifications />
//                   </Badge>
//                 </IconButton>
//               </Tooltip>
//             </motion.div>

//             {/* User Profile */}
//             <UserProfileMenu />

//             {/* Mobile Menu Button */}
//             {isMobile && (
//               <IconButton
//                 onClick={() => setMobileMenuOpen(true)}
//                 sx={{ color: 'white', ml: 1 }}
//               >
//                 <MenuIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Mobile Navigation Drawer */}
//       <Drawer
//         anchor="right"
//         open={mobileMenuOpen}
//         onClose={() => setMobileMenuOpen(false)}
//         PaperProps={{
//           sx: {
//             bgcolor: 'rgba(0, 8, 20, 0.95)',
//             backdropFilter: 'blur(20px)',
//             border: '1px solid rgba(12, 192, 223, 0.3)',
//             color: 'white'
//           }
//         }}
//       >
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
//           <Typography variant="h6" sx={{ color: '#0cc0df', fontWeight: 'bold' }}>
//             Navigation
//           </Typography>
//           <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
//             <Close />
//           </IconButton>
//         </Box>
//         <Divider sx={{ borderColor: 'rgba(12, 192, 223, 0.2)' }} />
//         <NavigationMenu isMobile onClose={() => setMobileMenuOpen(false)} />
//       </Drawer>
//     </motion.div>
//   );
// };

// export default Header;
// src/components/common/Header.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Box,
  Chip
} from '@mui/material';
import { 
  AccountCircle, 
  Dashboard, 
  Assignment,
  Leaderboard, 
  ExitToApp,
  Person
} from '@mui/icons-material';
import { getRank } from '../../utils/helpers';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { userProgress } = useSelector(state => state.challenges);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // You can dispatch logout action if you have one
    // dispatch(logoutUser());
    
    handleClose();
    navigate('/');
    window.location.reload(); // Force reload to reset auth state
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #1976d2, #1565c0)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <Toolbar>
        {/* Logo */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            cursor: 'pointer', 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
          onClick={() => navigate('/')}
        >
          🤖 Aurora Rising
        </Typography>

        {/* Navigation Links - Only show when authenticated */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
            <Button 
              color="inherit" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
              sx={{ 
                fontWeight: isActivePath('/dashboard') ? 'bold' : 'normal',
                backgroundColor: isActivePath('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Assignment />}
              onClick={() => navigate('/challenges')}
              sx={{ 
                fontWeight: isActivePath('/challenges') ? 'bold' : 'normal',
                backgroundColor: isActivePath('/challenges') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Challenges
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Leaderboard />}
              onClick={() => navigate('/leaderboard')}
              sx={{ 
                fontWeight: isActivePath('/leaderboard') ? 'bold' : 'normal',
                backgroundColor: isActivePath('/leaderboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Leaderboard
            </Button>
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Section */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* User Progress Chip */}
            {userProgress && (
              <Chip
                label={`Score: ${userProgress.totalScore || 0}`}
                color="secondary"
                size="small"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
            )}

            {/* User Rank Chip */}
            <Chip
              label={getRank(userProgress?.challengesCompleted || 0, userProgress?.totalScore || 0)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            
            {/* User Avatar and Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ p: 1 }}
            >
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user?.username ? user.username[0].toUpperCase() : <Person />}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/challenges'); }}>
                <Assignment sx={{ mr: 1 }} />
                Challenges
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/leaderboard'); }}>
                <Leaderboard sx={{ mr: 1 }} />
                Leaderboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ fontWeight: 'bold' }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;