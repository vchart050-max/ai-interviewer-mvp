import React, { useState } from 'react';

function HRDashboard() {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');

  const generateLink = async () => {
    // Create a new candidate in database
    const candidateId = Math.random().toString(36).substr(2, 9);
    const link = `${window.location.origin}/interview?candidateId=${candidateId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    
    // Show HR the link
    alert(`Link copied to clipboard:\n\n${link}\n\nEmail this to: ${candidateEmail}`);
  };

  return (
    <div className="hr-dashboard">
      <h1>Send Interview Link to Candidate</h1>
      
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
      
      <button onClick={generateLink}>Generate & Copy Link</button>
    </div>
  );
}

export default HRDashboard;