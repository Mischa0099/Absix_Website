// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import { Box } from '@mui/material';

// // Store imports
// import { store, persistor } from './store';

// // Context imports
// import { ErrorProvider } from './contexts/ErrorContext';

// // Component imports
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import Header from './components/common/Header';
// import Footer from './components/common/Footer';
// import ErrorBoundary from './components/common/ErrorBoundary';
// import LoadingSpinner from './components/common/LoadingSpinner';

// // Page imports
// import HomePage from './pages/HomePage';
// import DashboardPage from './pages/DashboardPage';
// import ChallengesListPage from './pages/ChallengesListPage';
// import ChallengePage from './pages/ChallengePage';
// import LeaderboardPage from './pages/LeaderboardPage';
// import ProfilePage from './pages/ProfilePage';
// import IndividualChallengePage from './pages/IndividualChallengePage';

// // Loading component for PersistGate
// const PersistGateLoading = () => (
//   <Box 
//     display="flex" 
//     justifyContent="center" 
//     alignItems="center" 
//     minHeight="100vh"
//     bgcolor="#000814"
//     color="white"
//   >
//     <LoadingSpinner />
//   </Box>
// );

// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#0cc0df',
//     },
//     secondary: {
//       main: '#007acc',
//     },
//     background: {
//       default: '#000814',
//       paper: '#1a1a1a',
//     },
//     text: {
//       primary: '#ffffff',
//       secondary: 'rgba(255, 255, 255, 0.7)',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none',
//         },
//       },
//     },
//   },
// });

// function App() {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
//         <ThemeProvider theme={darkTheme}>
//           <CssBaseline />
//           <ErrorProvider>
//             <ErrorBoundary>
//               <Router>
//                 <div className="App">
//                   <Header />
//                   <main className="main-content">
//                     <Routes>
//                       {/* Public Routes */}
//                       <Route path="/" element={<HomePage />} />
//                       <Route path="/login" element={<HomePage />} />
//                       <Route path="/register" element={<HomePage />} />
                      
//                       {/* Protected Routes */}
//                       <Route 
//                         path="/dashboard" 
//                         element={
//                           <ProtectedRoute>
//                             <DashboardPage />
//                           </ProtectedRoute>
//                         } 
//                       />
                      
//                       {/* Challenges Routes */}
//                       <Route 
//                         path="/challenges" 
//                         element={
//                           <ProtectedRoute>
//                             <ChallengesListPage />
//                           </ProtectedRoute>
//                         } 
//                       />
                      
//                       <Route 
//                         path="/challenge/:id" 
//                         element={
//                           <ProtectedRoute>
//                             <ChallengePage />
//                           </ProtectedRoute>
//                         } 
//                       />
                      
//                       <Route 
//                         path="/challenges/:challengeId" 
//                         element={
//                           <ProtectedRoute>
//                             <IndividualChallengePage />
//                           </ProtectedRoute>
//                         } 
//                       />
                      
//                       {/* Other Protected Routes */}
//                       <Route 
//                         path="/leaderboard" 
//                         element={
//                           <ProtectedRoute>
//                             <LeaderboardPage />
//                           </ProtectedRoute>
//                         } 
//                       />
                      
//                       <Route 
//                         path="/profile" 
//                         element={
//                           <ProtectedRoute>
//                             <ProfilePage />
//                           </ProtectedRoute>
//                         } 
//                       />
//                     </Routes>
//                   </main>
//                   <Footer />
//                 </div>
//               </Router>
//             </ErrorBoundary>
//           </ErrorProvider>
//         </ThemeProvider>
//       </PersistGate>
//     </Provider>
//   );
// }

// export default App;
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Store imports
import { store, persistor } from './store';

// Context imports
import { ErrorProvider } from './contexts/ErrorContext';

// Component imports
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page imports
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ChallengesListPage from './pages/ChallengesListPage';
import ChallengePage from './pages/ChallengePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import IndividualChallengePage from './pages/IndividualChallengePage';

// Loading component for PersistGate
const PersistGateLoading = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    bgcolor="#000814"
    color="white"
  >
    <LoadingSpinner />
  </Box>
);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0cc0df',
    },
    secondary: {
      main: '#007acc',
    },
    background: {
      default: '#000814',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <ErrorProvider>
            <ErrorBoundary>
              <Router>
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<HomePage />} />
                      <Route path="/register" element={<HomePage />} />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Challenges Routes */}
                      <Route 
                        path="/challenges" 
                        element={
                          <ProtectedRoute>
                            <ChallengesListPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Challenge Overview Page - shows challenge details and start button */}
                      <Route 
                        path="/challenge/:id" 
                        element={
                          <ProtectedRoute>
                            <ChallengePage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Challenge Execution Page - the actual challenge interface */}
                      <Route 
                        path="/challenges/:challengeId" 
                        element={
                          <ProtectedRoute>
                            <IndividualChallengePage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Alternative challenge execution route */}
                      <Route 
                        path="/challenge/:id/run" 
                        element={
                          <ProtectedRoute>
                            <IndividualChallengePage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Other Protected Routes */}
                      <Route 
                        path="/leaderboard" 
                        element={
                          <ProtectedRoute>
                            <LeaderboardPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Catch-all route - redirect to dashboard if logged in, home if not */}
                      <Route 
                        path="*" 
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </ErrorBoundary>
          </ErrorProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;