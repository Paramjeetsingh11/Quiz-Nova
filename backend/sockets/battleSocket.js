const { Server } = require("socket.io");
const env = require("../config/env");
const User = require("../models/User");
const { verifyToken } = require("../utils/token");
const battleService = require("../services/battleService");

function registerBattleSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin === "*" ? true : env.clientOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const payload = verifyToken(token);
      const user = await User.findById(payload.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { userId: socket.user.id });

    socket.on("battle:find", async ({ topic } = {}) => {
      try {
        const match = battleService.enqueuePlayer({
          socketId: socket.id,
          user: socket.user,
          topic
        });

        if (match.status === "queued") {
          socket.emit("battle:queued", { message: "Waiting for opponent" });
          return;
        }

        const room = await battleService.createBattleRoom({
          roomId: match.roomId,
          players: match.players,
          topic: topic || match.players[0].topic
        });

        for (const player of match.players) {
          const playerSocket = io.sockets.sockets.get(player.socketId);
          playerSocket?.join(match.roomId);
        }

        io.to(match.roomId).emit("battle:matched", battleService.publicRoomState(room));
      } catch (error) {
        socket.emit("battle:error", { message: error.message });
      }
    });

    socket.on("battle:answer", ({ roomId, questionId, answer } = {}) => {
      const room = battleService.submitBattleAnswer({
        roomId,
        userId: socket.user.id,
        questionId,
        answer
      });

      if (!room) {
        socket.emit("battle:error", { message: "Battle room not found" });
        return;
      }

      io.to(roomId).emit("battle:score", {
        roomId,
        scores: battleService.publicRoomState(room).scores
      });
    });

    socket.on("battle:finish", async ({ roomId } = {}) => {
      try {
        const result = await battleService.finishRoom(roomId);

        if (!result) {
          socket.emit("battle:error", { message: "Battle room not found" });
          return;
        }

        io.to(roomId).emit("battle:finished", result);
        io.in(roomId).socketsLeave(roomId);
      } catch (error) {
        socket.emit("battle:error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      battleService.removeFromQueue(socket.id);
    });
  });

  return io;
}

module.exports = registerBattleSocket;
