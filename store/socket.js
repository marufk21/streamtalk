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
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? "https://stream-talk.vercel.app/"
        : `http://localhost:${port}/`;

    // Establish a connection to the Socket.IO server
    const connection = io(socketUrl, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    console.log("Socket connection to:", socketUrl);
    setSocket(connection);

    // Handle connection events
    connection.on("connect", () => {
      // Socket connected successfully
    });

    connection.on("disconnect", (reason) => {
      // Socket disconnected
    });

    // Handle connection error
    connection.on("connect_error", async (err) => {
      // Try to initialize the socket endpoint
      try {
        await fetch(`/api/socket`);
      } catch (fetchError) {
        // Failed to initialize socket endpoint
      }
    });

    // Cleanup on unmount
    return () => {
      connection.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
