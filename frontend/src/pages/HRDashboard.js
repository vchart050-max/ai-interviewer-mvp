/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
function HRDashboard({ supabase }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
 
 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchCandidates();
}, []);
 
  const fetchCandidates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
 
      const { data } = await supabase
        .from('candidates')
        .select(`
          *,
          interviews(*),
          mock_tests(*)
        `)
        .eq('company_id', session.user.id)
        .order('created_at', { ascending: false });
 
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleDecision = async (candidateId, decision) => {
    try {
      await supabase
        .from('hr_reviews')
        .insert([{
          candidate_id: candidateId,
          decision,
          reviewed_at: new Date().toISOString(),
        }]);
 
      fetchCandidates();
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  };
 
  if (loading) return <div>Loading...</div>;
 
  return (
    <div className="hr-dashboard">
      <nav className="navbar">
        <h2>ScoreBar - HR Dashboard</h2>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </nav>
 
      <div className="container">
        <h1>Candidates</h1>
 
        <div className="candidates-grid">
          <div className="candidates-list">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <p className="name">{candidate.name}</p>
                <p className="email">{candidate.email}</p>
                {candidate.interviews?.[0] && (
                  <p className="score">Score: {candidate.interviews[0].overall_score}/10</p>
                )}
              </div>
            ))}
          </div>
 
          {selectedCandidate && (
            <div className="candidate-details">
              <h2>{selectedCandidate.name}</h2>
              
              {/* Interview Video */}
              {selectedCandidate.interviews?.[0]?.video_url && (
                <div className="video-section">
                  <h3>Interview Recording</h3>
                  <video controls width="100%">
                    <source src={selectedCandidate.interviews[0].video_url} />
                  </video>
                </div>
              )}
 
              {/* Transcript */}
              {selectedCandidate.interviews?.[0]?.transcript && (
                <div className="transcript-section">
                  <h3>Transcript</h3>
                  <div className="transcript">
                    {selectedCandidate.interviews[0].transcript}
                  </div>
                </div>
              )}
 
              {/* Scores */}
              {selectedCandidate.interviews?.[0] && (
                <div className="scores-section">
                  <h3>AI Assessment</h3>
                  <div className="scores-grid">
                    <div className="score-item">
                      <span>Communication</span>
                      <p>{selectedCandidate.interviews[0].communication_score}/10</p>
                    </div>
                    <div className="score-item">
                      <span>Technical</span>
                      <p>{selectedCandidate.interviews[0].technical_score}/10</p>
                    </div>
                    <div className="score-item">
                      <span>Overall</span>
                      <p>{selectedCandidate.interviews[0].overall_score}/10</p>
                    </div>
                  </div>
                </div>
              )}
 
              {/* Decision Buttons */}
              <div className="decision-buttons">
                <button
                  onClick={() => handleDecision(selectedCandidate.id, 'advance')}
                  className="btn-success"
                >
                  ✓ Advance to Next Round
                </button>
                <button
                  onClick={() => handleDecision(selectedCandidate.id, 'reject')}
                  className="btn-danger"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default HRDashboard;