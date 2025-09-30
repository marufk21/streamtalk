import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? "https://stream-talk.vercel.app"
          : ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-video", userId);
    });

    socket.on("user-leave", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-leave", userId);
    });
  });

  res.end();
};

export default SocketHandler;
