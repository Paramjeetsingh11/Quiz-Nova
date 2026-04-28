const { query } = require("../config/db");

async function create({ roomId, user1, user2 }) {
  const result = await query(
    "INSERT INTO battles (room_id, user1, user2) VALUES (:roomId, :user1, :user2)",
    { roomId, user1, user2 }
  );
  return result.insertId;
}

async function finish({ roomId, winner }) {
  await query(
    "UPDATE battles SET winner = :winner, completed_at = CURRENT_TIMESTAMP WHERE room_id = :roomId",
    { roomId, winner }
  );
}

async function findByRoom(roomId) {
  const rows = await query(
    `SELECT id, room_id, user1, user2, winner, created_at, completed_at
     FROM battles
     WHERE room_id = :roomId
     LIMIT 1`,
    { roomId }
  );
  return rows[0] || null;
}

module.exports = {
  create,
  finish,
  findByRoom
};
