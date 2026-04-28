const { query } = require("../config/db");

const publicColumns = `
  id, name, email, xp, level, streak, avatar, role, last_quiz_date, created_at
`;

async function create({ name, email, passwordHash, avatar = null, role = "user" }) {
  const result = await query(
    `INSERT INTO users (name, email, password, avatar, role)
     VALUES (:name, :email, :passwordHash, :avatar, :role)`,
    { name, email, passwordHash, avatar, role }
  );

  return findById(result.insertId);
}

async function findByEmail(email, includePassword = false) {
  const rows = await query(
    `SELECT ${includePassword ? `${publicColumns}, password` : publicColumns}
     FROM users WHERE email = :email LIMIT 1`,
    { email }
  );
  return rows[0] || null;
}

async function findById(id, includePassword = false) {
  const rows = await query(
    `SELECT ${includePassword ? `${publicColumns}, password` : publicColumns}
     FROM users WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

async function updateProfile(id, { name, avatar }) {
  await query(
    `UPDATE users
     SET name = COALESCE(:name, name),
         avatar = COALESCE(:avatar, avatar),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = :id`,
    { id, name: name ?? null, avatar: avatar ?? null }
  );

  return findById(id);
}

async function applyGamification(id, { xp, level, streak, lastQuizDate }, connection) {
  const executor = connection || { execute: query };
  const sql = `
    UPDATE users
    SET xp = :xp,
        level = :level,
        streak = :streak,
        last_quiz_date = :lastQuizDate,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = :id
  `;

  if (connection) {
    await connection.execute(sql, { id, xp, level, streak, lastQuizDate });
  } else {
    await executor.execute(sql, { id, xp, level, streak, lastQuizDate });
  }

  return findById(id);
}

async function remove(id) {
  const result = await query("DELETE FROM users WHERE id = :id", { id });
  return result.affectedRows > 0;
}

async function list({ limit, offset }) {
  return query(
    `SELECT ${publicColumns}
     FROM users
     ORDER BY created_at DESC
     LIMIT :limit OFFSET :offset`,
    { limit, offset }
  );
}

module.exports = {
  create,
  findByEmail,
  findById,
  updateProfile,
  applyGamification,
  remove,
  list
};
