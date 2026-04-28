const { query } = require("../config/db");

async function create({ topic, createdBy, questions = [] }, connection) {
  const executor = connection || { execute: query };
  let quizResult;

  if (connection) {
    [quizResult] = await connection.execute(
      "INSERT INTO quizzes (topic, created_by) VALUES (:topic, :createdBy)",
      { topic, createdBy }
    );
  } else {
    quizResult = await query("INSERT INTO quizzes (topic, created_by) VALUES (:topic, :createdBy)", {
      topic,
      createdBy
    });
  }

  const quizId = quizResult.insertId;

  for (const item of questions) {
    const payload = {
      quizId,
      question: item.question,
      optionA: item.options?.A || item.option_a,
      optionB: item.options?.B || item.option_b,
      optionC: item.options?.C || item.option_c,
      optionD: item.options?.D || item.option_d,
      correctAnswer: item.correctAnswer || item.correct_answer,
      explanation: item.explanation || null
    };

    const sql = `
      INSERT INTO questions
        (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
      VALUES
        (:quizId, :question, :optionA, :optionB, :optionC, :optionD, :correctAnswer, :explanation)
    `;

    if (connection) {
      await connection.execute(sql, payload);
    } else {
      await executor.execute(sql, payload);
    }
  }

  return findById(quizId);
}

async function findById(id, includeAnswers = false) {
  const quizzes = await query(
    `SELECT id, topic, created_by, created_at
     FROM quizzes
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  if (!quizzes[0]) {
    return null;
  }

  const questionColumns = includeAnswers
    ? "id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation"
    : "id, quiz_id, question, option_a, option_b, option_c, option_d";

  const questions = await query(
    `SELECT ${questionColumns}
     FROM questions
     WHERE quiz_id = :id
     ORDER BY id ASC`,
    { id }
  );

  return {
    ...quizzes[0],
    questions: questions.map(formatQuestion)
  };
}

async function findLatestByTopic(topic, includeAnswers = false) {
  const rows = await query(
    `SELECT id FROM quizzes
     WHERE LOWER(topic) = LOWER(:topic)
     ORDER BY created_at DESC
     LIMIT 1`,
    { topic }
  );

  return rows[0] ? findById(rows[0].id, includeAnswers) : null;
}

async function list({ limit, offset }) {
  return query(
    `SELECT q.id, q.topic, q.created_by, q.created_at, u.name AS creator_name,
            COUNT(questions.id) AS question_count
     FROM quizzes q
     LEFT JOIN users u ON u.id = q.created_by
     LEFT JOIN questions ON questions.quiz_id = q.id
     GROUP BY q.id
     ORDER BY q.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { limit, offset }
  );
}

function formatQuestion(row) {
  return {
    id: row.id,
    quizId: row.quiz_id,
    question: row.question,
    options: {
      A: row.option_a,
      B: row.option_b,
      C: row.option_c,
      D: row.option_d
    },
    ...(row.correct_answer
      ? {
          correctAnswer: row.correct_answer,
          explanation: row.explanation
        }
      : {})
  };
}

module.exports = {
  create,
  findById,
  findLatestByTopic,
  list,
  formatQuestion
};
