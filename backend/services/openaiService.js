const OpenAI = require("openai");
const { z } = require("zod");
const env = require("../config/env");
const AppError = require("../utils/AppError");

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(8),
      options: z.object({
        A: z.string().min(1),
        B: z.string().min(1),
        C: z.string().min(1),
        D: z.string().min(1)
      }),
      correctAnswer: z.enum(["A", "B", "C", "D"]),
      explanation: z.string().min(5)
    })
  ).min(5).max(10)
});

async function generateQuiz({ topic, difficulty, count = 5 }) {
  if (!env.openai.apiKey) {
    throw new AppError("OPENAI_API_KEY is not configured", 503);
  }

  const client = new OpenAI({ apiKey: env.openai.apiKey });
  const safeCount = Math.min(Math.max(Number(count) || 5, 5), 10);

  const response = await client.chat.completions.create({
    model: env.openai.model,
    response_format: { type: "json_object" },
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content:
          "You generate mobile-ready quiz content. Return strict JSON only with a questions array. Each question has question, options A-D, correctAnswer, and explanation."
      },
      {
        role: "user",
        content: `Create ${safeCount} ${difficulty} multiple-choice questions about "${topic}". Keep options concise and explanations educational.`
      }
    ]
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new AppError("OpenAI returned an empty quiz", 502);
  }

  const parsed = quizSchema.parse(JSON.parse(content));
  return parsed.questions;
}

module.exports = {
  generateQuiz
};
