import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Interview({ supabase }) {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidateId');

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingsRef = useRef([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('interview_questions')
          .select('questions')
          .eq('candidate_id', candidateId)
          .single();

        if (error) throw error;

        setQuestions(data.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    };

    loadQuestions();
    startVideo();
  }, [candidateId, supabase]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Please allow camera and microphone access');
    }
  };

  const startRecording = async () => {
    try {
      const question = questions[currentQuestion];

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

      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 90000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording answer');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitInterview();
    }
  };

  const submitInterview = async () => {
    setLoading(true);
    try {
      let fullTranscript = '';

      for (const recording of recordingsRef.current) {
        const formData = new FormData();
        formData.append('file', recording.video);

        const transcriptResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/transcribe`,
          formData
        );

        fullTranscript += `Q: ${recording.question}\nA: ${transcriptResponse.data.transcript}\n\n`;
      }

      const scoreResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/interview/score`,
        {
          candidateId,
          transcript: fullTranscript,
        }
      );

      const { error } = await supabase
        .from('interviews')
        .insert([
          {
            candidate_id: candidateId,
            transcript: fullTranscript,
            technical_score: scoreResponse.data.technical_knowledge,
            communication_score: scoreResponse.data.communication,
            overall_score: scoreResponse.data.overall,
            feedback: scoreResponse.data.feedback,
          },
        ]);

      if (error) throw error;

      setScore(scoreResponse.data);
      setIsComplete(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting interview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading interview...</div>;
  }

  if (!candidateId) {
    return <div className="error">No candidate ID provided</div>;
  }

  if (questions.length === 0) {
    return <div className="error">No questions found for this interview</div>;
  }

  if (isComplete && score) {
    return (
      <div className="interview-complete">
        <h1>Interview Complete!</h1>
        <div className="completion-message">
          <p>Thank you for completing the interview. Your responses have been recorded and will be reviewed by the HR team.</p>
        </div>
        <div className="scores">
          <div className="score-box">
            <p>Technical Knowledge</p>
            <h2>{score.technical_knowledge}/10</h2>
          </div>
          <div className="score-box">
            <p>Communication</p>
            <h2>{score.communication}/10</h2>
          </div>
          <div className="score-box">
            <p>Overall Score</p>
            <h2>{score.overall}/10</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h1>Interview</h1>
        <p>Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      <div className="interview-content">
        <video ref={videoRef} autoPlay muted />
        {isRecording && <div className="recording-indicator">● RECORDING</div>}

        <div className="question-display">
          <h2>{questions[currentQuestion]}</h2>
          <p>You have 90 seconds to answer</p>
        </div>

        <div className="button-group">
          {!isRecording ? (
            <button onClick={startRecording} className="btn-primary">
              Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="btn-secondary">
              Stop Recording
            </button>
          )}

          {!isRecording && recordingsRef.current.length > currentQuestion && (
            <button onClick={nextQuestion} disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : currentQuestion === questions.length - 1 ? 'Submit Interview' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;