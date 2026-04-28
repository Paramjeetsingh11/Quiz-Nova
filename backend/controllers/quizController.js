const { z } = require("zod");
const { transaction } = require("../config/db");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const gamificationService = require("../services/gamificationService");
const quizService = require("../services/quizService");

const topicSchema = z.object({
  query: z.object({
    topic: z.string().min(2).max(120)
  })
});

const submitSchema = z.object({
  body: z.object({
    quizId: z.number().int().positive(),
    answers: z.array(
      z.object({
        questionId: z.number().int().positive(),
        answer: z.enum(["A", "B", "C", "D"])
      })
    ).min(1)
  })
});

const getByTopic = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findLatestByTopic(req.query.topic, false);

  if (!quiz) {
    throw new AppError("No quiz found for this topic. Generate one with /api/ai/generate-quiz.", 404);
  }

  return success(res, { quiz }, "Quiz fetched");
});

const submitQuiz = asyncHandler(async (req, res) => {
  quizService.assertAnswerPayload(req.body.answers);
  const quiz = await Quiz.findById(req.body.quizId, true);

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  const evaluation = quizService.evaluateQuiz(quiz, req.body.answers);

  const payload = await transaction(async (connection) => {
    await Result.create(
      {
        userId: req.user.id,
        quizId: quiz.id,
        score: evaluation.score,
        accuracy: evaluation.accuracy,
        totalQuestions: evaluation.totalQuestions
      },
      connection
    );

    const progress = gamificationService.applyProgress(req.user, evaluation);
    await User.applyGamification(req.user.id, progress, connection);

    return { evaluation, progress };
  });

  return success(res, payload, "Quiz submitted");
});

module.exports = {
  getByTopic,
  submitQuiz,
  topicSchema,
  submitSchema
};
