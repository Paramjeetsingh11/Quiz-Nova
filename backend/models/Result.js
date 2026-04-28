const { query } = require("../config/db");

async function create({ userId, quizId, score, accuracy, totalQuestions }, connection) {
  const sql = `
    INSERT INTO results (user_id, quiz_id, score, accuracy, total_questions)
    VALUES (:userId, :quizId, :score, :accuracy, :totalQuestions)
  `;
  const params = { userId, quizId, score, accuracy, totalQuestions };

  if (connection) {
    const [result] = await connection.execute(sql, params);
    return result.insertId;
  }

  const result = await query(sql, params);
  return result.insertId;
}

async function listByUser(userId, { limit = 20, offset = 0 } = {}) {
  return query(
    `SELECT r.id, r.quiz_id, q.topic, r.score, r.total_questions, r.accuracy, r.created_at
     FROM results r
     JOIN quizzes q ON q.id = r.quiz_id
     WHERE r.user_id = :userId
     ORDER BY r.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { userId, limit, offset }
  );
}

module.exports = {
  create,
  listByUser
};
