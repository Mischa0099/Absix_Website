import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  // FIXED: Proper form submission with preventDefault
  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 CRITICAL: Prevent page refresh
    
    if (!formData.username || !formData.password) {
      alert('Please fill in username and password');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting registration...');

    try {
      const success = await register(formData.username, formData.password, formData.email);
      
      if (success) {
        console.log('✅ Registration successful');
        console.log('Token stored:', !!localStorage.getItem('token'));
        console.log('User stored:', !!localStorage.getItem('user'));
        
        // Small delay to ensure token is stored before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        console.error('❌ Registration failed');
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('Registration error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}> {/* FIXED: onSubmit on form */}
      <div>
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Email (optional):</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;