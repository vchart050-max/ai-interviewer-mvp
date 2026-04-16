import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
 
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);
 
function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
 
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
 
      if (authError) throw authError;
 
      // Create user in database
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          role,
          company_name: role === 'hr' ? companyName : null,
          created_at: new Date().toISOString(),
        },
      ]);
 
      if (dbError) throw dbError;
 
      // Call backend to send welcome email
      await axios.post(`${process.env.REACT_APP_API_URL}/api/emails/welcome`, {
        email,
        role,
      });
 
      navigate(role === 'hr' ? '/hr-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>ScoreBar</h1>
        <p className="subtitle">The AI That Scores Candidates</p>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>I am a...</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="candidate">Candidate</option>
              <option value="hr">HR Manager</option>
            </select>
          </div>
 
          {role === 'hr' && (
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}
 
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
 
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
 
export default Signup;