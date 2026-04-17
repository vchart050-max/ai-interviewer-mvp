/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
 
const MOCK_TEST_QUESTIONS = [
  "Tell me about your professional background",
  "Why are you interested in this role?",
  "What are your technical skills?",
  "Walk me through a project you're proud of",
  "How do you handle tight deadlines?",
  "Tell me about a challenge you overcame",
  "What are your salary expectations?",
  "How do you work in teams?",
  "What's your biggest strength?",
  "Where do you see yourself in 5 years?"
];
 
function MockTest({ supabase }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    startVideo();
  }, []);
 
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Please allow camera access');
    }
  };
 
  const startQuestion = async () => {
    const question = MOCK_TEST_QUESTIONS[currentQuestionIndex];
    
    try {
      // Use OpenAI text-to-speech to ask the question
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/tts`, {
        text: question,
      });
 
      const audio = new Audio(response.data.audioUrl);
      await audio.play();
 
      // Start recording candidate's answer
      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
 
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // Upload video to Supabase storage
        const fileName = `mock-test-${Date.now()}.webm`;
        const { data, error } = await supabase.storage
          .from('recordings')
          .upload(fileName, blob);
 
        if (!error) {
          setAnswers([...answers, {
            question,
            videoPath: data.path,
            timestamp: new Date().toISOString(),
          }]);
        }
      };
 
      mediaRecorderRef.current.start();
      setIsRecording(true);
 
      // 45 seconds per answer
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 45000);
    } catch (error) {
      console.error('Error starting question:', error);
    }
  };
 
  const goToNextQuestion = () => {
    if (currentQuestionIndex < MOCK_TEST_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitMockTest();
    }
  };
 
  const submitMockTest = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get candidate ID
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
 
      // Send to backend for scoring
      const result = await axios.post(`${process.env.REACT_APP_API_URL}/api/mock-test/score`, {
        candidateId: candidateData.id,
        answers,
      });
 
      setScore(result.data);
      setTestComplete(true);
    } catch (error) {
      console.error('Error submitting mock test:', error);
      alert('Error submitting test');
    } finally {
      setLoading(false);
    }
  };
 
  if (testComplete && score) {
    return (
      <div className="test-complete">
        <div className="score-card">
          <h1>Mock Test Complete!</h1>
          <div className="score-display">
            <div className="score-item">
              <span>Technical Knowledge</span>
              <p className="score">{score.technical_knowledge}/10</p>
            </div>
            <div className="score-item">
              <span>Communication</span>
              <p className="score">{score.communication}/10</p>
            </div>
            <div className="score-item">
              <span>Overall</span>
              <p className="score-large">{score.overall}/10</p>
            </div>
          </div>
          <p className="summary">{score.feedback}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="mock-test">
      <div className="test-container">
        <h2>Mock Technical Interview</h2>
        <p className="question-counter">Question {currentQuestionIndex + 1} of {MOCK_TEST_QUESTIONS.length}</p>
 
        <div className="video-area">
          <video ref={videoRef} autoPlay muted />
          {isRecording && <div className="recording-indicator">● RECORDING</div>}
        </div>
 
        <div className="question-display">
          <p className="question">{MOCK_TEST_QUESTIONS[currentQuestionIndex]}</p>
          <p className="instruction">You have 45 seconds to answer</p>
        </div>
 
        <div className="button-group">
          {!isRecording ? (
            <button onClick={startQuestion} className="btn-primary">
              Start Recording Answer
            </button>
          ) : (
            <button onClick={() => {
              mediaRecorderRef.current?.stop();
              setIsRecording(false);
            }} className="btn-secondary">
              Stop Recording
            </button>
          )}
          
          {!isRecording && answers.length > currentQuestionIndex && (
            <button onClick={goToNextQuestion} className="btn-primary">
              {currentQuestionIndex === MOCK_TEST_QUESTIONS.length - 1 ? 'Submit Test' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default MockTest;