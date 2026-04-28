const { query } = require("../config/db");

async function globalLeaderboard(limit = 50) {
  return query(
    `SELECT id, name, avatar, xp, level, streak
     FROM users
     ORDER BY xp DESC, level DESC, streak DESC
     LIMIT :limit`,
    { limit }
  );
}

async function weeklyLeaderboard(limit = 50) {
  return query(
    `SELECT u.id, u.name, u.avatar, u.level, u.streak,
            COALESCE(SUM(r.score * 20), 0) AS weekly_xp,
            COUNT(r.id) AS weekly_quizzes,
            ROUND(COALESCE(AVG(r.accuracy), 0), 2) AS weekly_accuracy
     FROM users u
     LEFT JOIN results r
       ON r.user_id = u.id
      AND r.created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY
     GROUP BY u.id
     ORDER BY weekly_xp DESC, weekly_accuracy DESC, weekly_quizzes DESC
     LIMIT :limit`,
    { limit }
  );
}

module.exports = {
  globalLeaderboard,
  weeklyLeaderboard
};
