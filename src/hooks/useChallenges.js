import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchChallenges, 
  startChallenge, 
  submitChallenge, 
  setCurrentChallenge,
  clearCurrentChallenge,
  updateChallengeProgress 
} from '../store/challengeSlice';

export const useChallenges = () => {
  const dispatch = useDispatch();
  const challengeState = useSelector(state => state.challenges);

  const loadChallenges = useCallback(async () => {
    try {
      await dispatch(fetchChallenges());
      return true;
    } catch (error) {
      console.error('Failed to load challenges:', error);
      return false;
    }
  }, [dispatch]);

  const beginChallenge = useCallback(async (challengeId, parameters = {}) => {
    try {
      const result = await dispatch(startChallenge({ challengeId, parameters }));
      return result.type.includes('fulfilled');
    } catch (error) {
      console.error('Failed to start challenge:', error);
      return false;
    }
  }, [dispatch]);

  const submitSolution = useCallback(async (challengeId, submission) => {
    try {
      const result = await dispatch(submitChallenge({ challengeId, submission }));
      return result.type.includes('fulfilled') ? result.payload.data : null;
    } catch (error) {
      console.error('Failed to submit challenge:', error);
      return null;
    }
  }, [dispatch]);

  const setActive = useCallback((challenge) => {
    dispatch(setCurrentChallenge(challenge));
  }, [dispatch]);

  const clearActive = useCallback(() => {
    dispatch(clearCurrentChallenge());
  }, [dispatch]);

  const updateProgress = useCallback((challengeId, progress) => {
    dispatch(updateChallengeProgress({ challengeId, progress }));
  }, [dispatch]);

  const getChallengeById = useCallback((id) => {
    return challengeState.challenges.find(c => c.id === id);
  }, [challengeState.challenges]);

  const getCompletedChallenges = useCallback(() => {
    return challengeState.challenges.filter(c => c.completed);
  }, [challengeState.challenges]);

  const getAvailableChallenges = useCallback(() => {
    return challengeState.challenges.filter(c => !c.locked && !c.completed);
  }, [challengeState.challenges]);

  return {
    ...challengeState,
    loadChallenges,
    beginChallenge,
    submitSolution,
    setActive,
    clearActive,
    updateProgress,
    getChallengeById,
    getCompletedChallenges,
    getAvailableChallenges,
  };
};