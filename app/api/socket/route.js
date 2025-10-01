import { NextRequest } from "next/server";

// In-memory store for room data (in production, use Redis or similar)
const rooms = new Map();
const userSessions = new Map();

// Clean up old sessions (older than 5 minutes)
const cleanupOldSessions = () => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  for (const [sessionId, session] of userSessions.entries()) {
    if (now - session.lastSeen > fiveMinutes) {
      // Remove user from room
      if (session.roomId && rooms.has(session.roomId)) {
        const room = rooms.get(session.roomId);
        room.users = room.users.filter((user) => user.id !== session.userId);
        if (room.users.length === 0) {
          rooms.delete(session.roomId);
        }
      }
      userSessions.delete(sessionId);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupOldSessions, 60000);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const roomId = searchParams.get("roomId");
  const userId = searchParams.get("userId");
  const sessionId = searchParams.get("sessionId");

  try {
    switch (action) {
      case "join-room":
        if (!roomId || !userId) {
          return Response.json(
            { error: "Missing roomId or userId" },
            { status: 400 }
          );
        }

        // Create session
        const newSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        userSessions.set(newSessionId, {
          userId,
          roomId,
          lastSeen: Date.now(),
        });

        // Add user to room
        if (!rooms.has(roomId)) {
          rooms.set(roomId, { users: [] });
        }

        const room = rooms.get(roomId);
        const existingUserIndex = room.users.findIndex(
          (user) => user.id === userId
        );

        if (existingUserIndex >= 0) {
          room.users[existingUserIndex] = {
            id: userId,
            sessionId: newSessionId,
            joinedAt: Date.now(),
          };
        } else {
          room.users.push({
            id: userId,
            sessionId: newSessionId,
            joinedAt: Date.now(),
          });
        }

        return Response.json({
          success: true,
          sessionId: newSessionId,
          roomUsers: room.users.map((u) => u.id),
        });

      case "get-room-users":
        if (!roomId) {
          return Response.json({ error: "Missing roomId" }, { status: 400 });
        }

        const roomData = rooms.get(roomId);
        if (!roomData) {
          return Response.json({ users: [] });
        }

        return Response.json({ users: roomData.users.map((u) => u.id) });

      case "leave-room":
        if (!roomId || !userId) {
          return Response.json(
            { error: "Missing roomId or userId" },
            { status: 400 }
          );
        }

        if (rooms.has(roomId)) {
          const room = rooms.get(roomId);
          room.users = room.users.filter((user) => user.id !== userId);
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }

        // Clean up session
        for (const [id, session] of userSessions.entries()) {
          if (session.userId === userId && session.roomId === roomId) {
            userSessions.delete(id);
            break;
          }
        }

        return Response.json({ success: true });

      case "ping":
        if (sessionId) {
          const session = userSessions.get(sessionId);
          if (session) {
            session.lastSeen = Date.now();
            return Response.json({ success: true });
          }
        }
        return Response.json({ error: "Session not found" }, { status: 404 });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, roomId, userId, sessionId, targetUserId } = body;

    switch (action) {
      case "toggle-audio":
        if (!roomId || !userId) {
          return Response.json(
            { error: "Missing roomId or userId" },
            { status: 400 }
          );
        }

        // Broadcast to other users in the room
        if (rooms.has(roomId)) {
          const room = rooms.get(roomId);
          const otherUsers = room.users.filter((user) => user.id !== userId);

          // In a real implementation, you'd store this event and poll for it
          // For now, we'll just return success
          return Response.json({
            success: true,
            event: "user-toggle-audio",
            targetUserId: userId,
            affectedUsers: otherUsers.map((u) => u.id),
          });
        }

        return Response.json({ error: "Room not found" }, { status: 404 });

      case "toggle-video":
        if (!roomId || !userId) {
          return Response.json(
            { error: "Missing roomId or userId" },
            { status: 400 }
          );
        }

        if (rooms.has(roomId)) {
          const room = rooms.get(roomId);
          const otherUsers = room.users.filter((user) => user.id !== userId);

          return Response.json({
            success: true,
            event: "user-toggle-video",
            targetUserId: userId,
            affectedUsers: otherUsers.map((u) => u.id),
          });
        }

        return Response.json({ error: "Room not found" }, { status: 404 });

      case "ping":
        if (sessionId) {
          const session = userSessions.get(sessionId);
          if (session) {
            session.lastSeen = Date.now();
            return Response.json({ success: true });
          }
        }
        return Response.json({ error: "Session not found" }, { status: 404 });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
