const { query } = require("../config/db");

async function getUserAnalytics(userId) {
  const [summary] = await query(
    `SELECT COUNT(*) AS total_quizzes,
            COALESCE(AVG(accuracy), 0) AS average_accuracy,
            COALESCE(SUM(score), 0) AS total_correct,
            COALESCE(SUM(total_questions), 0) AS total_questions
     FROM results
     WHERE user_id = :userId`,
    { userId }
  );

  const weakTopics = await query(
    `SELECT q.topic, COUNT(*) AS attempts, ROUND(AVG(r.accuracy), 2) AS average_accuracy
     FROM results r
     JOIN quizzes q ON q.id = r.quiz_id
     WHERE r.user_id = :userId
     GROUP BY q.topic
     HAVING average_accuracy < 70
     ORDER BY average_accuracy ASC, attempts DESC
     LIMIT 5`,
    { userId }
  );

  const recentPerformance = await query(
    `SELECT DATE(created_at) AS date, ROUND(AVG(accuracy), 2) AS average_accuracy, COUNT(*) AS quizzes
     FROM results
     WHERE user_id = :userId
       AND created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    { userId }
  );

  return {
    totalQuizzes: Number(summary.total_quizzes || 0),
    averageAccuracy: Number(Number(summary.average_accuracy || 0).toFixed(2)),
    totalCorrect: Number(summary.total_correct || 0),
    totalQuestions: Number(summary.total_questions || 0),
    weakTopics,
    recentPerformance
  };
}

module.exports = {
  getUserAnalytics
};
