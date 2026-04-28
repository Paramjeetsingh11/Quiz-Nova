const DAY_MS = 24 * 60 * 60 * 1000;

function calculateXp({ score, totalQuestions, accuracy }) {
  const base = score * 20;
  const perfectBonus = accuracy === 100 ? 50 : 0;
  const participation = totalQuestions > 0 ? 10 : 0;
  return base + perfectBonus + participation;
}

function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function updateStreak(user, now = new Date()) {
  const today = startOfUtcDay(now);

  if (!user.last_quiz_date) {
    return { streak: 1, lastQuizDate: today };
  }

  const last = startOfUtcDay(new Date(user.last_quiz_date));
  const diffDays = Math.round((today.getTime() - last.getTime()) / DAY_MS);

  if (diffDays === 0) {
    return { streak: user.streak || 1, lastQuizDate: today };
  }

  if (diffDays === 1) {
    return { streak: (user.streak || 0) + 1, lastQuizDate: today };
  }

  return { streak: 1, lastQuizDate: today };
}

function applyProgress(user, quizStats) {
  const earnedXp = calculateXp(quizStats);
  const nextXp = (user.xp || 0) + earnedXp;
  const { streak, lastQuizDate } = updateStreak(user);

  return {
    earnedXp,
    xp: nextXp,
    level: levelFromXp(nextXp),
    streak,
    lastQuizDate: lastQuizDate.toISOString().slice(0, 10)
  };
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

module.exports = {
  calculateXp,
  levelFromXp,
  updateStreak,
  applyProgress
};
