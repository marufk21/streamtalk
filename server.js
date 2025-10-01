const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: dev
        ? [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ]
        : "https://streamtalk.onrender.com",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("join-room", (roomId, userId) => {
      console.log(`👤 User ${userId} joining room ${roomId}`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      console.log(`🔊 User ${userId} toggled audio in room ${roomId}`);
      socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      console.log(`📹 User ${userId} toggled video in room ${roomId}`);
      socket.broadcast.to(roomId).emit("user-toggle-video", userId);
    });

    socket.on("user-leave", (userId, roomId) => {
      console.log(`👋 User ${userId} leaving room ${roomId}`);
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit("user-leave", userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, reason);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server running on http://${hostname}:${port}`);
      console.log("📡 Socket.IO server initialized");
    });
});
