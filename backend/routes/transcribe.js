const express = require('express');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
 
const upload = multer({ storage: multer.memoryStorage() });
 
// Transcribe audio
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
 
    // Use Deepgram API
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      req.file.buffer,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm',
        },
      }
    );
 
    const transcript = response.data.results.channels[0].alternatives[0].transcript;
 
    res.json({ 
      transcript,
      confidence: response.data.results.channels[0].alternatives[0].confidence,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;