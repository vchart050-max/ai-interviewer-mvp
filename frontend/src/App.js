/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import MockTest from './pages/MockTest';
import Interview from './pages/Interview';
import HRDashboard from './pages/HRDashboard';
import Pricing from './pages/Pricing';
import './App.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setUserRole('candidate'); // Default to candidate for now
        }
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
        <Route path="/pricing" element={<Pricing />} />

        {/* Candidate Routes */}
        <Route path="/dashboard" element={user ? <CandidateDashboard supabase={supabase} /> : <Navigate to="/" />} />
        <Route path="/mock-test" element={user ? <MockTest supabase={supabase} /> : <Navigate to="/" />} />
        <Route path="/interview/:id" element={user ? <Interview supabase={supabase} /> : <Navigate to="/" />} />

        {/* HR Routes */}
        <Route path="/hr-dashboard" element={user ? <HRDashboard supabase={supabase} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;