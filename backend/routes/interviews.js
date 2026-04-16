const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
 
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
 
// Score interview
router.post('/score', async (req, res) => {
  try {
    const { candidateId, transcript } = req.body;
 
    // Score with Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Score this interview transcript on a scale of 1-10 for:
1. Communication clarity
2. Technical knowledge
3. Problem-solving approach
4. Relevant experience
5. Cultural fit
 
Transcript:
${transcript}
 
Return ONLY valid JSON:
{
  "communication_score": 8,
  "technical_score": 7,
  "problem_solving": 8,
  "experience_relevance": 7,
  "cultural_fit": 6,
  "overall_score": 7.2,
  "feedback": "Strong technical skills with good communication..."
}`,
        },
      ],
    });
 
    const scoreText = message.content[0].text;
    const scores = JSON.parse(scoreText);
 
    // Save to database
    const { data, error } = await supabase
      .from('interviews')
      .insert([
        {
          candidate_id: candidateId,
          transcript,
          communication_score: scores.communication_score,
          technical_score: scores.technical_score,
          overall_score: scores.overall_score,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
 
    if (error) throw error;
 
    res.json(scores);
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
// Score mock test
router.post('/mock-test/score', async (req, res) => {
  try {
    const { candidateId, answers } = req.body;
 
    // Combine all answers into text
    const transcript = answers
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');
 
    // Score with Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Score this mock interview on technical knowledge and communication (1-10 each):
 
${transcript}
 
Return ONLY valid JSON:
{
  "technical_knowledge": 7,
  "communication": 8,
  "overall": 7.5,
  "feedback": "Good technical foundation..."
}`,
        },
      ],
    });
 
    const scoreText = message.content[0].text;
    const scores = JSON.parse(scoreText);
 
    // Save to database
    const { data, error } = await supabase
      .from('mock_tests')
      .insert([
        {
          candidate_id: candidateId,
          technical_knowledge: scores.technical_knowledge,
          communication: scores.communication,
          overall_score: scores.overall,
          transcript,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
 
    if (error) throw error;
 
    res.json(scores);
  } catch (error) {
    console.error('Mock test scoring error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;