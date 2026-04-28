const crypto = require("crypto");
const Battle = require("../models/Battle");
const Quiz = require("../models/Quiz");
const env = require("../config/env");
const AppError = require("../utils/AppError");

const queue = [];
const activeRooms = new Map();

function enqueuePlayer(player) {
  const existing = queue.find((item) => item.user.id === player.user.id);
  if (existing) {
    return { status: "queued" };
  }

  const opponentIndex = queue.findIndex((item) => item.user.id !== player.user.id);

  if (opponentIndex === -1) {
    queue.push(player);
    return { status: "queued" };
  }

  const [opponent] = queue.splice(opponentIndex, 1);
  const roomId = `battle_${crypto.randomUUID()}`;

  return {
    status: "matched",
    roomId,
    players: [opponent, player]
  };
}

function removeFromQueue(socketId) {
  const index = queue.findIndex((item) => item.socketId === socketId);
  if (index >= 0) {
    queue.splice(index, 1);
  }
}

async function createBattleRoom({ roomId, players, topic = "general knowledge" }) {
  const quiz = await Quiz.findLatestByTopic(topic, true);
  const questions = quiz?.questions?.slice(0, env.battle.questionCount) || [];

  if (questions.length === 0) {
    throw new AppError(`No battle questions found for topic "${topic}"`, 404);
  }

  await Battle.create({
    roomId,
    user1: players[0].user.id,
    user2: players[1].user.id
  });

  activeRooms.set(roomId, {
    roomId,
    players: players.map((player) => player.user),
    scores: new Map(players.map((player) => [player.user.id, 0])),
    answered: new Set(),
    questions
  });

  return activeRooms.get(roomId);
}

function submitBattleAnswer({ roomId, userId, questionId, answer }) {
  const room = activeRooms.get(roomId);
  if (!room) {
    return null;
  }

  const question = room.questions.find((item) => Number(item.id) === Number(questionId));
  const answerKey = `${userId}:${questionId}`;

  if (!question || room.answered.has(answerKey)) {
    return room;
  }

  room.answered.add(answerKey);

  if (question.correctAnswer === String(answer).toUpperCase()) {
    room.scores.set(userId, (room.scores.get(userId) || 0) + 1);
  }

  return room;
}

async function finishRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) {
    return null;
  }

  const scores = [...room.scores.entries()].map(([userId, score]) => ({ userId, score }));
  scores.sort((a, b) => b.score - a.score);
  const winner = scores.length > 1 && scores[0].score === scores[1].score ? null : scores[0]?.userId || null;

  await Battle.finish({ roomId, winner });
  activeRooms.delete(roomId);

  return {
    roomId,
    winner,
    scores
  };
}

function publicRoomState(room) {
  return {
    roomId: room.roomId,
    players: room.players,
    scores: [...room.scores.entries()].map(([userId, score]) => ({ userId, score })),
    questions: room.questions.map(({ correctAnswer, explanation, ...question }) => question)
  };
}

module.exports = {
  enqueuePlayer,
  removeFromQueue,
  createBattleRoom,
  submitBattleAnswer,
  finishRoom,
  publicRoomState
};
