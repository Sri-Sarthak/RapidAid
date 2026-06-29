const { Server } = require("socket.io");

let io = null;

// Maps a Mongo user _id (string) -> Set of socket ids
// (a user could have multiple tabs/devices open at once)
const userSockets = new Map();

const initSocket = (httpServer, corsOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Frontend calls socket.emit("register", userId) right after connecting
    socket.on("register", (userId) => {
      if (!userId) return;
      const key = String(userId);
      if (!userSockets.has(key)) userSockets.set(key, new Set());
      userSockets.get(key).add(socket.id);
      socket.data.userId = key;
    });

    socket.on("disconnect", () => {
      const key = socket.data.userId;
      if (key && userSockets.has(key)) {
        userSockets.get(key).delete(socket.id);
        if (userSockets.get(key).size === 0) userSockets.delete(key);
      }
    });
  });

  return io;
};

/**
 * Emit a realtime event to every connected socket belonging to `userId`.
 * Silently no-ops if the user isn't currently online.
 */
const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  sockets.forEach((socketId) => io.to(socketId).emit(event, payload));
};

const isUserOnline = (userId) => userSockets.has(String(userId));

const getIO = () => io;

module.exports = { initSocket, emitToUser, isUserOnline, getIO };
