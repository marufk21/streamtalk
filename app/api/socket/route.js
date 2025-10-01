import { NextRequest } from "next/server";
import { Server } from "socket.io";
import { createServer } from "http";

let io = null;
let httpServer = null;

export function initializeSocketIO() {
  if (io) {
    return io;
  }

  const dev = process.env.NODE_ENV !== "production";

  // Create HTTP server for Socket.IO
  httpServer = createServer();

  io = new Server(httpServer, {
    path: "/api/socket",
    transports: ["polling", "websocket"],
    allowEIO3: true,
    cors: {
      origin: dev
        ? ["http://localhost:3000"]
        : ["https://stream-talk.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Store user info for cleanup on disconnect
    let currentUser = null;
    let currentRoom = null;

    socket.on("join-room", (roomId, userId) => {
      try {
        console.log(`👤 User ${userId} joining room ${roomId}`);

        // Validate inputs
        if (!roomId || !userId) {
          console.error("❌ Invalid roomId or userId provided");
          socket.emit("error", "Invalid roomId or userId");
          return;
        }

        // Store current user info
        currentUser = userId;
        currentRoom = roomId;

        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);

        // Send confirmation back to the user
        socket.emit("joined-room", roomId);
      } catch (error) {
        console.error("❌ Error in join-room:", error);
        socket.emit("error", "Failed to join room");
      }
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      try {
        console.log(`🔊 User ${userId} toggled audio in room ${roomId}`);

        if (!userId || !roomId) {
          console.error("❌ Invalid userId or roomId for audio toggle");
          return;
        }

        socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
      } catch (error) {
        console.error("❌ Error in user-toggle-audio:", error);
      }
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      try {
        console.log(`📹 User ${userId} toggled video in room ${roomId}`);

        if (!userId || !roomId) {
          console.error("❌ Invalid userId or roomId for video toggle");
          return;
        }

        socket.broadcast.to(roomId).emit("user-toggle-video", userId);
      } catch (error) {
        console.error("❌ Error in user-toggle-video:", error);
      }
    });

    socket.on("user-leave", (userId, roomId) => {
      try {
        console.log(`👋 User ${userId} leaving room ${roomId}`);

        // Clear current user info since they're leaving
        if (currentUser === userId) {
          currentUser = null;
          currentRoom = null;
        }

        if (roomId) {
          socket.leave(roomId);
          socket.broadcast.to(roomId).emit("user-leave", userId);
        }
      } catch (error) {
        console.error("❌ Error in user-leave:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      try {
        console.log("❌ Socket disconnected:", socket.id, reason);

        // If user was in a room, notify others that they left
        if (currentUser && currentRoom) {
          console.log(
            `👋 User ${currentUser} automatically leaving room ${currentRoom} due to disconnect`
          );
          socket.broadcast.to(currentRoom).emit("user-leave", currentUser);
        }

        // Clean up user info
        currentUser = null;
        currentRoom = null;
      } catch (error) {
        console.error("❌ Error in disconnect handler:", error);
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  // Start the HTTP server
  const port = process.env.SOCKET_PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`📡 Socket.IO server running on port ${port}`);
  });

  return io;
}

// Initialize Socket.IO when the module loads
const ioInstance = initializeSocketIO();

export async function GET(request) {
  return new Response("Socket.IO server running", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

export async function POST(request) {
  return new Response("Socket.IO server running", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

// Export the io instance for use in other parts of the app
export { ioInstance as io };
