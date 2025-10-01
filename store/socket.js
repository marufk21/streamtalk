import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Determine the current port from window.location or fallback
    const getCurrentPort = () => {
      if (typeof window !== "undefined") {
        return window.location.port || "3000";
      }
      return "3000"; // fallback
    };

    const port = getCurrentPort();
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const socketUrl = isLocalhost
      ? `http://localhost:${port}/`
      : "https://stream-talk.vercel.app//";

    console.log("🌐 Environment check:", {
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "unknown",
      port,
      isLocalhost,
      socketUrl,
      NODE_ENV: process.env.NODE_ENV,
      windowLocation:
        typeof window !== "undefined" ? window.location.href : "unknown",
    });

    // Force local development detection
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      console.log("🔧 Forcing localhost configuration");
    }

    // Initialize the socket endpoint first
    const initializeSocket = async () => {
      try {
        console.log("Initializing socket endpoint...");
        await fetch(`/api/socket`);
        console.log("Socket endpoint initialized");
      } catch (error) {
        console.warn("Failed to initialize socket endpoint:", error);
      }

      // Establish a connection to the Socket.IO server
      const connection = io(socketUrl, {
        path: "/api/socket",
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        // Add timestamp to force cache busting
        query: {
          t: Date.now(),
        },
      });

      console.log("Attempting socket connection to:", socketUrl);
      setSocket(connection);

      // Handle connection events
      connection.on("connect", () => {
        console.log("✅ Socket connected successfully!", connection.id);
      });

      connection.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      connection.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      });

      connection.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Attempting to reconnect...", attemptNumber);
      });

      connection.on("reconnect_error", (error) => {
        console.error("❌ Reconnection failed:", error);
      });

      connection.on("reconnect_failed", () => {
        console.error("❌ Failed to reconnect after maximum attempts");
      });

      // Handle connection error
      connection.on("connect_error", async (err) => {
        console.error("❌ Socket connection error:", err);
        // Try to initialize the socket endpoint again
        try {
          console.log("Retrying socket endpoint initialization...");
          await fetch(`/api/socket`);
        } catch (fetchError) {
          console.error("Failed to initialize socket endpoint:", fetchError);
        }
      });

      return connection;
    };

    let connection;
    initializeSocket().then((conn) => {
      connection = conn;
    });

    // Cleanup on unmount
    return () => {
      if (connection) {
        console.log("Cleaning up socket connection...");
        connection.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
