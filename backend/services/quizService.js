const AppError = require("../utils/AppError");

function evaluateQuiz(quiz, answers) {
  const answerMap = new Map(answers.map((answer) => [Number(answer.questionId), String(answer.answer).toUpperCase()]));
  const totalQuestions = quiz.questions.length;
  let score = 0;

  const review = quiz.questions.map((question) => {
    const selectedAnswer = answerMap.get(Number(question.id)) || null;
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    };
  });

  const accuracy = totalQuestions ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

  return {
    score,
    totalQuestions,
    accuracy,
    review
  };
}

function assertAnswerPayload(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError("answers must be a non-empty array", 422);
  }

  for (const answer of answers) {
    if (!answer.questionId || !["A", "B", "C", "D"].includes(String(answer.answer).toUpperCase())) {
      throw new AppError("Each answer requires questionId and answer A/B/C/D", 422);
    }
  }
}

module.exports = {
  evaluateQuiz,
  assertAnswerPayload
};
