import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const QUESTIONS = [
  "Tell me about your professional background",
  "Why are you interested in this role?",
  "What are your technical skills?",
  "Walk me through a project you built",
  "Do you have any questions for us?"
];

function Interview() {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingsRef = useRef([]);

  useEffect(() => {
    startVideo();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Please allow camera access');
    }
  };

  const startRecording = async () => {
    try {
      // Text-to-speech: Ask question
      const question = QUESTIONS[currentQuestion];
      
      const ttsResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/tts`,
        { text: question }
      );

      // Play audio of question
      const audio = new Audio(ttsResponse.data.audioUrl);
      await audio.play();

      // Start recording answer
      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        recordingsRef.current.push({
          question,
          video: blob,
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Record for 60 seconds
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      }, 60000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All done - submit interview
      submitInterview();
    }
  };

  const submitInterview = async () => {
    setLoading(true);
    try {
      // For each recording, transcribe and collect transcript
      let fullTranscript = '';

      for (const recording of recordingsRef.current) {
        // Transcribe video audio
        const formData = new FormData();
        formData.append('file', recording.video);

        const transcriptResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/transcribe`,
          formData
        );

        fullTranscript += `Q: ${recording.question}\nA: ${transcriptResponse.data.transcript}\n\n`;
      }

      // Score with Claude
      const scoreResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/interview/score`,
        {
          candidateId,
          transcript: fullTranscript,
        }
      );

      setScore(scoreResponse.data);
      setIsComplete(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting interview');
    } finally {
      setLoading(false);
    }
  };

  if (isComplete && score) {
    return (
      <div className="interview-complete">
        <h1>Interview Complete!</h1>
        <div className="scores">
          <div>
            <p>Technical Knowledge</p>
            <h2>{score.technical_knowledge}/10</h2>
          </div>
          <div>
            <p>Communication</p>
            <h2>{score.communication}/10</h2>
          </div>
          <div>
            <p>Overall</p>
            <h2>{score.overall}/10</h2>
          </div>
        </div>
        <p>Thank you! Your interview has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="interview">
      <h1>Interview</h1>
      <p>Question {currentQuestion + 1} of {QUESTIONS.length}</p>

      <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '500px' }} />
      {isRecording && <p style={{ color: 'red' }}>● RECORDING</p>}

      <h2>{QUESTIONS[currentQuestion]}</h2>

      <div>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={() => {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
          }}>Stop Recording</button>
        )}

        {!isRecording && recordingsRef.current.length > currentQuestion && (
          <button onClick={nextQuestion} disabled={loading}>
            {loading ? 'Processing...' : currentQuestion === QUESTIONS.length - 1 ? 'Submit Interview' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Interview;