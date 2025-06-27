// src/components/challenges/ChallengeHistoryDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';
import challengeService from '../../services/challengeService';
import LoadingSpinner from '../common/LoadingSpinner';
import { getScoreColor } from '../../utils/helpers';

const ChallengeHistoryDialog = ({ open, onClose, challengeId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (open && challengeId) {
      fetchHistory();
    }
  }, [open, challengeId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await challengeService.getChallengeHistory(challengeId);
      const historyData = response.data.history || [];
      
      setHistory(historyData);
      
      // Calculate statistics
      if (historyData.length > 0) {
        const scores = historyData.map(h => h.score || 0);
        const stats = {
          totalAttempts: historyData.length,
          bestScore: Math.max(...scores),
          averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
          firstScore: scores[0],
          latestScore: scores[scores.length - 1],
          improvementTrend: scores[scores.length - 1] - scores[0]
        };
        setStats(stats);
      }
      
    } catch (err) {
      setError('Failed to load challenge history');
      console.error('Error fetching challenge history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.paper' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Challenge History
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <LoadingSpinner message="Loading history..." />
        ) : error ? (
          <Box className="text-center" sx={{ py: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : history.length === 0 ? (
          <Box className="text-center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              No history available for this challenge
            </Typography>
          </Box>
        ) : (
          <>
            {/* Statistics Summary */}
            {stats && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: getScoreColor(stats.bestScore), fontWeight: 'bold' }}>
                      {stats.bestScore}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best Score
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: getScoreColor(stats.averageScore), fontWeight: 'bold' }}>
                      {Math.round(stats.averageScore)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average Score
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {stats.totalAttempts}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Attempts
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {stats.improvementTrend > 0 ? (
                        <TrendingUp sx={{ color: 'success.main' }} />
                      ) : (
                        <TrendingDown sx={{ color: 'warning.main' }} />
                      )}
                      <Typography variant="h4" sx={{ 
                        color: stats.improvementTrend > 0 ? 'success.main' : 'warning.main',
                        fontWeight: 'bold' 
                      }}>
                        {stats.improvementTrend > 0 ? '+' : ''}{Math.round(stats.improvementTrend)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Improvement
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            )}

            {/* History Table */}
            <Typography variant="h6" gutterBottom>
              Attempt History
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Attempt #</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((attempt, index) => (
                    <TableRow key={attempt.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          #{history.length - index}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: getScoreColor(attempt.score || 0)
                            }}
                          >
                            {attempt.score || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(attempt.timestamp || attempt.completed_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={attempt.success ? 'Passed' : 'Failed'}
                          size="small"
                          color={attempt.success ? 'success' : 'error'}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {attempt.feedback || attempt.notes || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChallengeHistoryDialog;