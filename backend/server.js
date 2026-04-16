require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
 
const app = express();
 
// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
 
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
 
// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
 
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
 
// Import routes
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const interviewRoutes = require('./routes/interviews');
const transcribeRoutes = require('./routes/transcribe');
const ttsRoutes = require('./routes/tts');
const paymentRoutes = require('./routes/payments');
const emailRoutes = require('./routes/emails');
 
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/emails', emailRoutes);
 
// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ScoreBar backend running on port ${PORT}`);
});