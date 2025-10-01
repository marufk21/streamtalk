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

    // Force local development detection
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
    }

    // Initialize the socket connection
    const initializeSocket = async () => {

      // Establish a connection to the Socket.IO server
      const connection = io(socketUrl, {
        path: "/api/socket",
        transports: ["polling", "websocket"],
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      setSocket(connection);

      // Handle connection events
      connection.on("connect", () => {
      });

      connection.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      connection.on("reconnect", (attemptNumber) => {
      });

      connection.on("reconnect_attempt", (attemptNumber) => {
      });

      connection.on("reconnect_error", (error) => {
      });

      connection.on("reconnect_failed", () => {
      });

      // Handle connection error
      connection.on("connect_error", async (err) => {
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
