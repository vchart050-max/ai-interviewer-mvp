import React, { useState } from 'react';

function HRDashboard({ supabase }) {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');

  const generateLink = async () => {
    if (!candidateName || !candidateEmail) {
      alert("Please fill all fields");
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name: candidateName,
          email: candidateEmail,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error creating candidate");
      return;
    }

    const candidateId = data.id;

    const link = `${window.location.origin}/interview?candidateId=${candidateId}`;

    await navigator.clipboard.writeText(link);

    alert(`Link copied:\n\n${link}`);
    
    // Optional: reset form
    setCandidateName('');
    setCandidateEmail('');
  };

  return (
    <div className="hr-dashboard">
      <h1>Send Interview Link</h1>

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

      <button onClick={generateLink}>
        Generate & Copy Link
      </button>
    </div>
  );
}

export default HRDashboard;