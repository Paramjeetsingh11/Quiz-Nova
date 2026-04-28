import { create } from 'zustand';
import { quizAPI, aiAPI } from '../services/api';

const useQuizStore = create((set, get) => ({
  // ─── State ─────────────────────────────────────────────────────────────────
  questions: [],
  currentIndex: 0,
  selectedAnswers: {},
  score: 0,
  topic: '',
  isLoading: false,
  isSubmitting: false,
  error: null,
  result: null,
  aiQuestions: [],
  isAILoading: false,

  // ─── Fetch Quiz ─────────────────────────────────────────────────────────────
  fetchQuiz: async (topic) => {
    set({ isLoading: true, error: null, questions: [], topic, currentIndex: 0, selectedAnswers: {}, score: 0, result: null });
    try {
      const res = await quizAPI.getQuizByTopic(topic);
      const questions = res.data?.questions || res.data || [];
      set({ questions, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load quiz.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Generate AI Quiz ────────────────────────────────────────────────────────
  generateAIQuiz: async (topic, difficulty = 'medium', count = 10) => {
    set({ isAILoading: true, error: null, aiQuestions: [] });
    try {
      const res = await aiAPI.generateQuiz({ topic, difficulty, count });
      const questions = res.data?.questions || res.data || [];
      set({ aiQuestions: questions, isAILoading: false });
      return { success: true, questions };
    } catch (err) {
      const message = err.response?.data?.message || 'AI quiz generation failed.';
      set({ error: message, isAILoading: false });
      return { success: false, message };
    }
  },

  // ─── Select Answer ───────────────────────────────────────────────────────────
  selectAnswer: (questionIndex, answer) => {
    set((state) => ({
      selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer },
    }));
  },

  // ─── Next Question ───────────────────────────────────────────────────────────
  nextQuestion: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    }));
  },

  // ─── Submit Quiz ─────────────────────────────────────────────────────────────
  submitQuiz: async () => {
    const { questions, selectedAnswers, topic } = get();
    set({ isSubmitting: true, error: null });
    try {
      const payload = {
        topic,
        answers: Object.entries(selectedAnswers).map(([index, answer]) => ({
          questionId: questions[Number(index)]?.id || Number(index),
          answer,
        })),
      };
      const res = await quizAPI.submitQuiz(payload);
      set({ result: res.data, isSubmitting: false });
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Submission failed.';
      set({ error: message, isSubmitting: false });
      return { success: false, message };
    }
  },

  // ─── Reset ───────────────────────────────────────────────────────────────────
  resetQuiz: () => {
    set({
      questions: [],
      currentIndex: 0,
      selectedAnswers: {},
      score: 0,
      topic: '',
      result: null,
      error: null,
      aiQuestions: [],
    });
  },
}));

export default useQuizStore;
