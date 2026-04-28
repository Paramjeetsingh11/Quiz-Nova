const { z } = require("zod");
const { transaction } = require("../config/db");
const Quiz = require("../models/Quiz");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const openaiService = require("../services/openaiService");

const generateSchema = z.object({
  body: z.object({
    topic: z.string().min(2).max(120),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    count: z.number().int().min(5).max(10).optional()
  })
});

const generateQuiz = asyncHandler(async (req, res) => {
  const questions = await openaiService.generateQuiz(req.body);
  const quiz = await transaction((connection) =>
    Quiz.create(
      {
        topic: req.body.topic,
        createdBy: req.user.id,
        questions
      },
      connection
    )
  );

  return success(res, { quiz }, "AI quiz generated", 201);
});

module.exports = {
  generateQuiz,
  generateSchema
};
