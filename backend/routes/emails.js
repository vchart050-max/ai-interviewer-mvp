const express = require('express');
const sgMail = require('@sendgrid/mail');
const router = express.Router();
 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 
// Send welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, role } = req.body;
 
    const message = {
      to: email,
      from: 'hello@scorebar.bar',
      subject: 'Welcome to ScoreBar!',
      html: `
        <h1>Welcome to ScoreBar</h1>
        <p>The AI that scores candidates.</p>
        <p>Your role: ${role}</p>
        <p>Get started by logging in to your dashboard.</p>
      `,
    };
 
    await sgMail.send(message);
 
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
// Send interview scheduled email
router.post('/interview-scheduled', async (req, res) => {
  try {
    const { candidateEmail, candidateName, interviewTime } = req.body;
 
    const message = {
      to: candidateEmail,
      from: 'hello@scorebar.bar',
      subject: `Your Interview with ScoreBar is Scheduled!`,
      html: `
        <h2>Hi ${candidateName},</h2>
        <p>Your interview is scheduled for: ${interviewTime}</p>
        <p>Log in to your ScoreBar account to join the interview.</p>
      `,
    };
 
    await sgMail.send(message);
 
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;