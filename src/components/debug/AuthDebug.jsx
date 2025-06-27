// =================== AuthDebug.jsx ===================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';

const AuthDebug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const { user, token, isAuthenticated, loading, error, isTokenValid } = useAuth();
  const authState = useSelector(state => state.auth);

  useEffect(() => {
    const updateDebugInfo = () => {
      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      
      let tokenPayload = null;
      let tokenExpiry = null;
      let isExpired = false;
      
      if (localToken) {
        try {
          tokenPayload = JSON.parse(atob(localToken.split('.')[1]));
          tokenExpiry = new Date(tokenPayload.exp * 1000);
          isExpired = tokenPayload.exp < Math.floor(Date.now() / 1000);
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }

      setDebugInfo({
        // Redux state
        reduxUser: !!authState.user,
        reduxToken: !!authState.token,
        reduxIsAuthenticated: authState.isAuthenticated,
        reduxLoading: authState.loading,
        reduxError: authState.error,
        
        // localStorage
        localStorageToken: !!localToken,
        localStorageUser: !!localUser,
        
        // Hook state
        hookUser: !!user,
        hookToken: !!token,
        hookIsAuthenticated: isAuthenticated,
        hookLoading: loading,
        hookError: error,
        hookIsTokenValid: isTokenValid(),
        
        // Token details
        tokenPayload: tokenPayload,
        tokenExpiry: tokenExpiry,
        isTokenExpired: isExpired,
        
        // Timestamps
        currentTime: new Date(),
        lastUpdate: new Date().toISOString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [user, token, isAuthenticated, loading, error, isTokenValid, authState]);

  const clearAllAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const testTokenValidity = async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Token test response:', response.status);
      alert(`Token test: ${response.status === 200 ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      console.error('Token test failed:', error);
      alert('Token test failed: ' + error.message);
    }
  };

  if (!isVisible) {
    return (
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        <button onClick={() => setIsVisible(true)} style={{ 
          padding: '5px 10px', 
          fontSize: '12px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '3px'
        }}>
          Auth Debug
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      width: '400px',
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>🔍 Auth Debug Panel</strong>
        <button onClick={() => setIsVisible(false)} style={{ 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer' 
        }}>
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>🏪 Redux State:</strong>
        <br />User: {debugInfo.reduxUser ? '✅' : '❌'}
        <br />Token: {debugInfo.reduxToken ? '✅' : '❌'}
        <br />Authenticated: {debugInfo.reduxIsAuthenticated ? '✅' : '❌'}
        <br />Loading: {debugInfo.reduxLoading ? '⏳' : '✅'}
        <br />Error: {debugInfo.reduxError || 'None'}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>💾 LocalStorage:</strong>
        <br />Token: {debugInfo.localStorageToken ? '✅' : '❌'}
        <br />User: {debugInfo.localStorageUser ? '✅' : '❌'}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>🎣 Hook State:</strong>
        <br />User: {debugInfo.hookUser ? '✅' : '❌'}
        <br />Token: {debugInfo.hookToken ? '✅' : '❌'}
        <br />Authenticated: {debugInfo.hookIsAuthenticated ? '✅' : '❌'}
        <br />Loading: {debugInfo.hookLoading ? '⏳' : '✅'}
        <br />Token Valid: {debugInfo.hookIsTokenValid ? '✅' : '❌'}
        <br />Error: {debugInfo.hookError || 'None'}
      </div>

      {debugInfo.tokenPayload && (
        <div style={{ marginBottom: '15px' }}>
          <strong>🎫 Token Info:</strong>
          <br />Expires: {debugInfo.tokenExpiry?.toLocaleString()}
          <br />Expired: {debugInfo.isTokenExpired ? '❌' : '✅'}
          <br />User ID: {debugInfo.tokenPayload.sub}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <strong>⏰ Last Update:</strong>
        <br />{debugInfo.lastUpdate}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={clearAllAuth} style={{ 
          padding: '5px 10px', 
          fontSize: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}>
          Clear All Auth
        </button>
        
        <button onClick={testTokenValidity} style={{ 
          padding: '5px 10px', 
          fontSize: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}>
          Test Token
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;