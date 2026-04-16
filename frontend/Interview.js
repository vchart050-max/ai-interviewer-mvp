import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
 
const INTERVIEW_QUESTIONS = [
  "Walk me through your background",
  "Why are you interested in this role?",
  "What are your technical skills?",
  "Tell me about a complex project",
  "How do you handle pressure?",
  "Describe your leadership style",
  "What's a failure you learned from?",
  "How do you stay updated on technology?",
  "What are your career goals?",
  "Do you have any questions for us?",
];
 
function Interview({ supabase }) {
  const { id } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(null);
 
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
    }
  };
 
  const startQuestion = async () => {
    const question = INTERVIEW_QUESTIONS[currentQuestionIndex];
 
    try {
      // Text-to-speech
      const ttsResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/tts`, {
        text: question,
      });
 
      const audio = new Audio(ttsResponse.data.audioUrl);
      await audio.play();
 
      // Start recording
      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
 
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecording(blob);
      };
 
      mediaRecorderRef.current.start();
      setIsRecording(true);
 
      // 3 minutes per question
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      }, 180000);
    } catch (error) {
      console.error('Error:', error);
    }
  };
 
  const goToNextQuestion = async () => {
    if (recording) {
      // Transcribe the recording
      const formData = new FormData();
      formData.append('file', recording);
 
      try {
        const transcriptResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/transcribe`,
          formData
        );
 
        setTranscript(transcriptResponse.data.transcript);
 
        if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setRecording(null);
        } else {
          submitInterview();
        }
      } catch (error) {
        console.error('Transcription error:', error);
      }
    }
  };
 
  const submitInterview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
 
      const result = await axios.post(`${process.env.REACT_APP_API_URL}/api/interview/score`, {
        candidateId: id,
        transcript,
      });
 
      setScore(result.data);
      setTestComplete(true);
    } catch (error) {
      console.error('Error submitting interview:', error);
    }
  };
 
  if (testComplete && score) {
    return (
      <div className="interview-complete">
        <h1>Interview Complete!</h1>
        <div className="score-display">
          <div className="score-item">
            <span>Communication</span>
            <p className="score">{score.communication}/10</p>
          </div>
          <div className="score-item">
            <span>Technical Knowledge</span>
            <p className="score">{score.technical_knowledge}/10</p>
          </div>
          <div className="score-item">
            <span>Overall</span>
            <p className="score-large">{score.overall}/10</p>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="interview-container">
      <h2>Live Interview</h2>
      <p>Question {currentQuestionIndex + 1} of {INTERVIEW_QUESTIONS.length}</p>
 
      <video ref={videoRef} autoPlay muted />
      {isRecording && <div className="recording">● Recording...</div>}
 
      <div className="question">
        <p>{INTERVIEW_QUESTIONS[currentQuestionIndex]}</p>
      </div>
 
      <div className="buttons">
        {!isRecording ? (
          <button onClick={startQuestion}>Start Recording</button>
        ) : (
          <button onClick={() => {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
          }}>Stop Recording</button>
        )}
        
        {recording && (
          <button onClick={goToNextQuestion}>
            {currentQuestionIndex === INTERVIEW_QUESTIONS.length - 1 ? 'Submit' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
 
export default Interview;