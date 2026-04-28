const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/db");
const registerBattleSocket = require("./sockets/battleSocket");

const server = http.createServer(app);
const io = registerBattleSocket(server);

async function start() {
  try {
    await pool.query("SELECT 1");

    server.listen(env.port, () => {
      console.log(`QuizNova API running on port ${env.port}`);
      console.log(`Socket.io ready with path /socket.io`);
    });
  } catch (error) {
    console.error("Failed to start QuizNova API:", error.message);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  io.close();
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

start();
