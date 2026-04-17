/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CandidateDashboard({ supabase }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>ScoreBar</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="container">
        <h1>Welcome to ScoreBar</h1>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Start Your Interview</h3>
            <p>Ready to take the mock test?</p>
            <button onClick={() => navigate('/mock-test')} className="btn-primary">
              Start Mock Test
            </button>
          </div>

          <div className="card">
            <h3>Your Progress</h3>
            <p>Complete the mock test first to unlock the live interview.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;