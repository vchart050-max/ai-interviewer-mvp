import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
 
function CandidateDashboard({ supabase }) {
  const [candidate, setCandidate] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [mockTestScore, setMockTestScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
 
        // Get candidate info
        const { data: candidateData } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
 
        setCandidate(candidateData);
 
        // Get mock test score
        const { data: mockData } = await supabase
          .from('mock_tests')
          .select('*')
          .eq('candidate_id', candidateData?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
 
        setMockTestScore(mockData);
 
        // Get interviews
        const { data: interviewsData } = await supabase
          .from('interviews')
          .select('*')
          .eq('candidate_id', candidateData?.id)
          .order('created_at', { ascending: false });
 
        setInterviews(interviewsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchCandidateData();
  }, [supabase]);
 
  if (loading) return <div className="loading">Loading...</div>;
 
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>ScoreBar</h2>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </nav>
 
      <div className="container">
        <h1>Welcome, {candidate?.name || 'Candidate'}</h1>
 
        <div className="dashboard-grid">
          {/* Mock Test Status */}
          <div className="card">
            <h3>Mock Test</h3>
            {mockTestScore ? (
              <div>
                <p className="score">Score: {mockTestScore.overall_score}/10</p>
                <p className="date">Completed: {new Date(mockTestScore.created_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <div>
                <p>No mock test completed yet</p>
                <button onClick={() => navigate('/mock-test')} className="btn-primary">
                  Start Mock Test
                </button>
              </div>
            )}
          </div>
 
          {/* Interviews */}
          <div className="card">
            <h3>Live Interviews</h3>
            {interviews.length > 0 ? (
              <div className="interview-list">
                {interviews.map((interview) => (
                  <div key={interview.id} className="interview-item">
                    <p className="date">{new Date(interview.created_at).toLocaleDateString()}</p>
                    <p className="score">Score: {interview.overall_score}/10</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No interviews completed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default CandidateDashboard;