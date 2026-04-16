import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);
 
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
 
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
 
      if (loginError) throw loginError;
 
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
 
      navigate(user?.role === 'hr' ? '/hr-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>ScoreBar</h1>
        <p className="subtitle">Login to Your Account</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
 
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
 
          {error && <div className="error">{error}</div>}
 
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
 
        <p className="login-link">
          Don't have an account? <a href="/">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
 
export default Login;