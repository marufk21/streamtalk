import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// API-based socket implementation for Vercel compatibility
class APISocket {
  constructor() {
    this.sessionId = null;
    this.roomId = null;
    this.userId = null;
    this.listeners = new Map();
    this.pollingInterval = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionStatus = "disconnected"; // 'disconnected', 'connecting', 'connected', 'error'
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Emit events by making API calls
  async emit(event, ...args) {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      switch (event) {
        case "join-room":
          const [roomId, userId] = args;
          this.roomId = roomId;
          this.userId = userId;
          this.isConnecting = true;
          this.connectionStatus = "connecting";
          this.trigger("connecting");

          const joinResponse = await fetch(
            `${baseUrl}/api/socket?action=join-room&roomId=${roomId}&userId=${userId}`
          );
          const joinData = await joinResponse.json();

          if (joinData.success) {
            this.sessionId = joinData.sessionId;
            this.isConnected = true;
            this.isConnecting = false;
            this.connectionStatus = "connected";
            this.reconnectAttempts = 0;
            this.startPolling();
            this.trigger("connect");
            this.trigger("joined-room", roomId);

            // Notify about existing users
            if (joinData.roomUsers) {
              joinData.roomUsers.forEach((userId) => {
                if (userId !== this.userId) {
                  this.trigger("user-connected", userId);
                }
              });
            }
          } else {
            this.isConnecting = false;
            this.connectionStatus = "error";
            this.trigger(
              "connect_error",
              new Error(joinData.error || "Failed to join room")
            );
          }
          break;

        case "user-toggle-audio":
          const [audioUserId, audioRoomId] = args;
          await this.makeAPICall("toggle-audio", {
            roomId: audioRoomId,
            userId: audioUserId,
          });
          break;

        case "user-toggle-video":
          const [videoUserId, videoRoomId] = args;
          await this.makeAPICall("toggle-video", {
            roomId: videoRoomId,
            userId: videoUserId,
          });
          break;

        case "user-leave":
          const [leaveUserId, leaveRoomId] = args;
          await this.makeAPICall("leave-room", {
            roomId: leaveRoomId,
            userId: leaveUserId,
          });
          break;
      }
    } catch (error) {
      console.error("❌ Socket emit error:", error);
      this.trigger("connect_error", error);
    }
  }

  async makeAPICall(action, data) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/socket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...data }),
    });

    return response.json();
  }

  // Start polling for room updates
  startPolling() {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      if (!this.sessionId || !this.roomId) return;

      try {
        // Ping to keep session alive
        await this.makeAPICall("ping", { sessionId: this.sessionId });

        // Get room users
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        const response = await fetch(
          `${baseUrl}/api/socket?action=get-room-users&roomId=${this.roomId}`
        );
        const data = await response.json();

        if (data.users) {
          // Check for new users
          const currentUsers = new Set(data.users);
          const previousUsers = new Set(this.lastKnownUsers || []);

          // Find new users
          currentUsers.forEach((userId) => {
            if (!previousUsers.has(userId) && userId !== this.userId) {
              this.trigger("user-connected", userId);
            }
          });

          // Find users who left
          previousUsers.forEach((userId) => {
            if (!currentUsers.has(userId) && userId !== this.userId) {
              this.trigger("user-leave", userId);
            }
          });

          this.lastKnownUsers = data.users;
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
        this.handleReconnect();
      }
    }, 2000); // Poll every 2 seconds
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      this.connectionStatus = "error";
      this.trigger("reconnect_failed");
      return;
    }

    this.reconnectAttempts++;
    this.isConnected = false;
    this.connectionStatus = "connecting";
    this.trigger("reconnect_attempt", this.reconnectAttempts);

    setTimeout(() => {
      if (this.roomId && this.userId) {
        this.emit("join-room", this.roomId, this.userId);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Event handling
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  trigger(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  disconnect() {
    this.stopPolling();
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionStatus = "disconnected";
    this.trigger("disconnect", "manual");

    if (this.roomId && this.userId) {
      this.makeAPICall("leave-room", {
        roomId: this.roomId,
        userId: this.userId,
      });
    }
  }
}

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("🔄 Initializing API-based socket connection");

    const apiSocket = new APISocket();
    socketRef.current = apiSocket;
    setSocket(apiSocket);

    // Handle connection events
    apiSocket.on("connecting", () => {
      console.log("🔄 Socket connecting...");
    });

    apiSocket.on("connect", () => {
      console.log("✅ Socket connected!");
    });

    apiSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    apiSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Socket reconnection attempt:", attemptNumber);
    });

    apiSocket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after all attempts");
    });

    apiSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection...");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
