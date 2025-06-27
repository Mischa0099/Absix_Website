// =================== DashboardPage.jsx (Updated) ===================
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChallenges } from '../../store/challengeSlice';
import DashboardLayout from '../dashboard/DashboardLayout';
import { useNotification } from '../common/Notification';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { error } = useSelector(state => state.challenges);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChallenges())
        .unwrap()
        .catch((error) => {
          showNotification('Failed to load challenges. Please refresh the page.', 'error');
        });
    }
  }, [dispatch, isAuthenticated, showNotification]);

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);

  return <DashboardLayout />;
};

export default DashboardPage;
