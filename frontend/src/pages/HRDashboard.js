import React, { useState } from 'react';

function HRDashboard({ supabase }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // For now, we'll just show a placeholder
  // Later we'll add real Supabase queries

  return (
    <div className="hr-dashboard">
      <nav className="navbar">
        <h2>ScoreBar - HR Dashboard</h2>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </nav>

      <div className="container">
        <h1>Interview Results</h1>

        <div className="candidates-grid">
          <div className="candidates-list">
            <div className="candidate-card">
              <p className="name">No interviews yet</p>
              <p className="email">Interviews will appear here once candidates complete them</p>
            </div>
          </div>

          <div className="candidate-details">
            <h2>Select a candidate to view results</h2>
            <p>Once a candidate completes their interview, you'll see:</p>
            <ul>
              <li>Video recording of the interview</li>
              <li>Full transcript of conversation</li>
              <li>AI scores: Technical, Communication, Overall</li>
              <li>Advance/Reject buttons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;