import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HRDashboard({ supabase }) {
  const [step, setStep] = useState('create'); // 'create' or 'review'
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [questions, setQuestions] = useState(['', '', '', '', '']); // 5 questions
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch interviews when in review mode
  useEffect(() => {
    if (step === 'review') {
      fetchInterviews();
    }
  }, [step]);

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const generateLink = async () => {
    if (!candidateName || !candidateEmail) {
      alert("Please fill candidate details");
      return;
    }

    if (questions.some(q => !q.trim())) {
      alert("Please fill all 5 questions");
      return;
    }

    setLoading(true);

    try {
      // Create candidate in Supabase
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .insert([
          {
            name: candidateName,
            email: candidateEmail,
          },
        ])
        .select()
        .single();

      if (candidateError) throw candidateError;

      const candidateId = candidateData.id;

      // Store questions for this candidate
      const { error: questionsError } = await supabase
        .from('interview_questions')
        .insert([
          {
            candidate_id: candidateId,
            questions: questions, // Store as JSON array
          },
        ]);

      if (questionsError) throw questionsError;

      // Generate link
      const link = `${window.location.origin}/interview?candidateId=${candidateId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(link);

      alert(`Interview link created!\n\nLink: ${link}\n\nEmail this link to: ${candidateEmail}`);

      // Reset form
      setCandidateName('');
      setCandidateEmail('');
      setQuestions(['', '', '', '', '']);
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating interview link');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'create') {
    return (
      <div className="hr-dashboard">
        <nav className="navbar">
          <h2>ScoreBar - HR Dashboard</h2>
          <div>
            <button onClick={() => setStep('review')} style={{ marginRight: '10px' }}>
              View Results
            </button>
            <button onClick={() => supabase.auth.signOut()}>Logout</button>
          </div>
        </nav>

        <div className="container">
          <h1>Create Interview</h1>

          <div className="create-interview-form">
            <h3>Candidate Details</h3>
            <input 
              placeholder="Candidate Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />

            <input 
              placeholder="Candidate Email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
            />

            <h3>Interview Questions (5 Required)</h3>
            {questions.map((question, index) => (
              <div key={index}>
                <label>Question {index + 1}</label>
                <textarea
                  placeholder={`Enter question ${index + 1}`}
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  rows="3"
                />
              </div>
            ))}

            <button onClick={generateLink} disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Generate Interview Link'}
            </button>
          </div>
        </div>

        <style>{`
          .create-interview-form {
            max-width: 600px;
            margin: 30px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }

          .create-interview-form input,
          .create-interview-form textarea {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }

          .create-interview-form label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
          }

          .create-interview-form h3 {
            margin-top: 20px;
          }
        `}</style>
      </div>
    );
  }

  // Review/Results view
  return (
    <div className="hr-dashboard">
      <nav className="navbar">
        <h2>ScoreBar - Interview Results</h2>
        <div>
          <button onClick={() => setStep('create')} style={{ marginRight: '10px' }}>
            New Interview
          </button>
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h1>Interview Results</h1>

        <div className="results-grid">
          <div className="results-list">
            {interviews.length === 0 ? (
              <p>No interviews yet</p>
            ) : (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  className={`result-card ${selectedInterview?.id === interview.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInterview(interview)}
                >
                  <p className="candidate-name">{interview.candidate_name}</p>
                  <p className="score">Score: {interview.overall_score || 'N/A'}/10</p>
                  <p className="date">{new Date(interview.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>

          {selectedInterview && (
            <div className="result-details">
              <h2>{selectedInterview.candidate_name}</h2>

              {selectedInterview.video_url && (
                <div className="video-section">
                  <h3>Interview Recording</h3>
                  <video controls width="100%" style={{ maxWidth: '500px' }}>
                    <source src={selectedInterview.video_url} type="video/webm" />
                    Your browser doesn't support video playback
                  </video>
                </div>
              )}

              {selectedInterview.transcript && (
                <div className="transcript-section">
                  <h3>Transcript</h3>
                  <div className="transcript-text">
                    {selectedInterview.transcript}
                  </div>
                </div>
              )}

              <div className="scores-section">
                <h3>AI Assessment</h3>
                <div className="scores-grid">
                  <div className="score-item">
                    <span>Technical</span>
                    <p className="score-value">{selectedInterview.technical_score || 'N/A'}/10</p>
                  </div>
                  <div className="score-item">
                    <span>Communication</span>
                    <p className="score-value">{selectedInterview.communication_score || 'N/A'}/10</p>
                  </div>
                  <div className="score-item">
                    <span>Overall</span>
                    <p className="score-value">{selectedInterview.overall_score || 'N/A'}/10</p>
                  </div>
                </div>
              </div>

              <div className="feedback-section">
                <h3>AI Feedback</h3>
                <p>{selectedInterview.feedback || 'No feedback yet'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .results-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
          margin-top: 30px;
        }

        .results-list {
          border: 1px solid #ddd;
          border-radius: 8px;
          max-height: 600px;
          overflow-y: auto;
        }

        .result-card {
          padding: 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: all 0.3s;
        }

        .result-card:hover {
          background: #f5f5f5;
        }

        .result-card.selected {
          background: #667eea;
          color: white;
        }

        .candidate-name {
          font-weight: bold;
          margin: 0;
        }

        .score {
          margin: 5px 0;
          color: inherit;
        }

        .date {
          font-size: 12px;
          opacity: 0.7;
          margin: 5px 0;
        }

        .result-details {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .video-section, .transcript-section, .scores-section, .feedback-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .transcript-text {
          background: white;
          padding: 15px;
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
          line-height: 1.6;
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .score-item {
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 4px;
        }

        .score-value {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }

        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default HRDashboard;