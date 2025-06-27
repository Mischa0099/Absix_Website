// src/components/challenges/QuizChallenge.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import { CheckCircle, Cancel, Quiz } from '@mui/icons-material';

const QuizChallenge = ({ onComplete, questions: customQuestions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);

  const defaultQuestions = [
    {
      id: 1,
      question: "What is the primary purpose of a PID controller in robotics?",
      options: [
        "To control motor speed only",
        "To provide feedback control for precise positioning",
        "To manage power consumption",
        "To handle communication protocols"
      ],
      correct: 1,
      explanation: "PID controllers use feedback to minimize error and achieve precise control."
    },
    {
      id: 2,
      question: "Which sensor is commonly used for obstacle avoidance?",
      options: [
        "Temperature sensor",
        "Ultrasonic sensor",
        "Light sensor",
        "Pressure sensor"
      ],
      correct: 1,
      explanation: "Ultrasonic sensors measure distance using sound waves, perfect for detecting obstacles."
    },
    {
      id: 3,
      question: "What does DOF stand for in robotics?",
      options: [
        "Degree of Freedom",
        "Direction of Force",
        "Dynamic Object Following",
        "Digital Output Function"
      ],
      correct: 0,
      explanation: "Degrees of Freedom refer to the number of independent ways a robot can move."
    },
    {
      id: 4,
      question: "Which type of motor provides the most precise control?",
      options: [
        "DC Motor",
        "AC Motor",
        "Servo Motor",
        "Stepper Motor"
      ],
      correct: 3,
      explanation: "Stepper motors move in discrete steps, providing excellent position control."
    },
    {
      id: 5,
      question: "What is forward kinematics in robotics?",
      options: [
        "Moving the robot forward",
        "Calculating end-effector position from joint angles",
        "Planning the fastest path",
        "Controlling wheel rotation"
      ],
      correct: 1,
      explanation: "Forward kinematics determines where the robot's end-effector will be based on joint positions."
    }
  ];

  const questions = customQuestions || defaultQuestions;

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, showResult]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(300);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedAnswer('');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, { 
      questionId: questions[currentQuestion].id,
      selected: parseInt(selectedAnswer),
      correct: questions[currentQuestion].correct,
      isCorrect: parseInt(selectedAnswer) === questions[currentQuestion].correct
    }];
    
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = (finalAnswers = answers) => {
    setQuizStarted(false);
    setShowResult(true);
    
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const timeUsed = 300 - timeLeft;
    
    const results = {
      totalQuestions: questions.length,
      correctAnswers,
      percentage,
      timeUsed,
      passed: percentage >= 70,
      score: Math.max(percentage + Math.max(50 - timeUsed, 0), 0)
    };

    if (onComplete) {
      onComplete(results);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizStarted && !showResult) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Robotics Knowledge Quiz
          </Typography>
          <Typography variant="body1" paragraph>
            Test your knowledge of robotics concepts, sensors, and control systems.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {questions.length} questions • 5 minutes • 70% to pass
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={startQuiz}
            sx={{ mt: 2 }}
          >
            Start Quiz
          </Button>
        </Paper>
      </Box>
    );
  }

  if (showResult) {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {passed ? (
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          ) : (
            <Cancel sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          )}
          
          <Typography variant="h4" gutterBottom>
            Quiz {passed ? 'Completed!' : 'Failed'}
          </Typography>
          
          <Typography variant="h6" paragraph>
            Score: {correctAnswers}/{questions.length} ({percentage}%)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Time Used: {formatTime(300 - timeLeft)}
          </Typography>

          <Box sx={{ mt: 3 }}>
            {answers.map((answer, index) => (
              <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">
                  Question {index + 1}
                </Typography>
                <Chip 
                  label={answer.isCorrect ? 'Correct' : 'Wrong'}
                  color={answer.isCorrect ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={startQuiz}
            sx={{ mt: 3 }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <Chip 
            label={formatTime(timeLeft)} 
            color={timeLeft < 60 ? 'error' : 'primary'}
          />
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / questions.length) * 100} 
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" paragraph>
          {questions[currentQuestion].question}
        </Typography>

        <RadioGroup
          value={selectedAnswer}
          onChange={(e) => handleAnswerSelect(e.target.value)}
        >
          {questions[currentQuestion].options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={index.toString()}
              control={<Radio />}
              label={option}
              sx={{ mb: 1 }}
            />
          ))}
        </RadioGroup>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Select an answer to continue
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === ''}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizChallenge;