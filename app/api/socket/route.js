import { Server } from "socket.io";
import { NextRequest, NextResponse } from "next/server";

let io;

const initSocketServer = (httpServer) => {
  if (!io) {
    console.log("Initializing Socket.IO server...");
    io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? "https://stream-talk.vercel.app/"
            : [
                `http://localhost:3000`,
                `http://localhost:3001`,
                `http://localhost:3002`,
              ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join-room", (roomId, userId) => {
        console.log(`User ${userId} joining room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
      });

      socket.on("user-toggle-audio", (userId, roomId) => {
        console.log(`User ${userId} toggled audio in room ${roomId}`);
        socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
      });

      socket.on("user-toggle-video", (userId, roomId) => {
        console.log(`User ${userId} toggled video in room ${roomId}`);
        socket.broadcast.to(roomId).emit("user-toggle-video", userId);
      });

      socket.on("user-leave", (userId, roomId) => {
        console.log(`User ${userId} leaving room ${roomId}`);
        socket.leave(roomId);
        socket.broadcast.to(roomId).emit("user-leave", userId);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", socket.id, reason);
      });
    });
  }
  return io;
};

// For App Router compatibility
export async function GET(request) {
  return new NextResponse("Socket.IO server running", { status: 200 });
}

export async function POST(request) {
  return new NextResponse("Socket.IO server running", { status: 200 });
}
