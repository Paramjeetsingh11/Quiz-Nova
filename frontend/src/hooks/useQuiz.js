import { useState, useEffect, useRef, useCallback } from 'react';
import useQuizStore from '../store/quizStore';

const useQuiz = (timePerQuestion = 30) => {
  const {
    questions, currentIndex, selectedAnswers,
    fetchQuiz, selectAnswer, nextQuestion, submitQuiz,
    resetQuiz, isLoading, isSubmitting, result, error,
  } = useQuizStore();

  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    setTimeLeft(timePerQuestion);
    setIsTimerRunning(true);
  }, [timePerQuestion]);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isTimerRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          // Auto-advance on timeout
          nextQuestion();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, nextQuestion]);

  // Reset timer on question change
  useEffect(() => {
    if (questions.length > 0) startTimer();
  }, [currentIndex, questions.length]);

  const handleSelectAnswer = (answer) => {
    stopTimer();
    selectAnswer(currentIndex, answer);
  };

  const handleNext = () => {
    stopTimer();
    nextQuestion();
  };

  const currentQuestion = questions[currentIndex] || null;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const timerProgress = timeLeft / timePerQuestion;
  const answeredCount = Object.keys(selectedAnswers).length;

  return {
    questions, currentIndex, currentQuestion, selectedAnswers,
    progress, timerProgress, timeLeft, answeredCount,
    isLoading, isSubmitting, result, error,
    fetchQuiz, handleSelectAnswer, handleNext, submitQuiz, resetQuiz,
  };
};

export default useQuiz;
