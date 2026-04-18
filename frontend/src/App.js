import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import Interview from './pages/Interview';
import HRDashboard from './pages/HRDashboard';
import './App.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div className="loading">Loading ScoreBar...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Signup supabase={supabase} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login supabase={supabase} />} />

        {/* Interview (public, needs candidateId param) */}
        <Route path="/interview" element={<Interview supabase={supabase} />} />

        {/* Candidate Routes */}
        <Route path="/dashboard" element={user ? <CandidateDashboard supabase={supabase} /> : <Navigate to="/login" />} />

        {/* HR Routes */}
        <Route path="/hr-dashboard" element={user ? <HRDashboard supabase={supabase} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;