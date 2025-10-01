import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  console.log("called api");
  if (res.socket.server.io) {
    console.log("socket already running");
  } else {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? "https://stream-talk.vercel.app"
            : [
                `http://localhost:3000`,
                `http://localhost:3001`,
                `http://localhost:3002`,
              ],
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("server is connected");

      socket.on("join-room", (roomId, userId) => {
        console.log(`a new user ${userId} joined room ${roomId}`);
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
  }
  res.end();
};

export default SocketHandler;
