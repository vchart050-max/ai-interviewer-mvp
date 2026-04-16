const express = require('express');
const axios = require('axios');
const router = express.Router();
 
// Text-to-speech
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
 
    // Use OpenAI Text-to-Speech API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: 'nova',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: 'arraybuffer',
      }
    );
 
    // Convert to base64
    const audioBase64 = Buffer.from(response.data).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
 
    res.json({ audioUrl });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;