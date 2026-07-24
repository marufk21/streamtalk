"use client";

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSocket } from "@/store/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();

  // Derive initial status from socket state during render; events handle updates.
  const [eventStatus, setEventStatus] = useState(null);
  const connectionStatus =
    eventStatus ??
    (socket
      ? socket.isConnected
        ? "Connected"
        : socket.isConnecting
          ? "Connecting..."
          : "Ready"
      : "Checking...");

  useEffect(() => {
    if (socket) {
      socket.on("connecting", () => {
        setEventStatus("Connecting...");
      });

      socket.on("connect", () => {
        setEventStatus("Connected");
      });

      socket.on("disconnect", () => {
        setEventStatus("Disconnected");
      });

      socket.on("connect_error", () => {
        setEventStatus("Connection failed");
      });
    }
  }, [socket]);

  const createAndJoin = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  };

  const joinRoom = (e) => {
    e?.preventDefault();
    if (roomId.trim()) router.push(`/${roomId.trim()}`);
    else {
      alert("Please provide a valid room ID");
    }
  };

  const getStatusVariant = () => {
    if (connectionStatus === "Connected") return "default";
    if (connectionStatus.includes("Connect")) return "secondary";
    if (connectionStatus === "Disconnected" || connectionStatus === "Connection failed")
      return "destructive";
    return "secondary";
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Subtle radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.2)_0%,transparent_70%)] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm mx-auto text-center animate-fade-in">
        {/* Wordmark */}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          StreamTalk
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Private video calls, no sign-up required.
        </p>

        {/* Connection badge */}
        <div className="flex justify-center mb-8">
          <Badge variant={getStatusVariant()} className="gap-1.5 px-3 py-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === "Connected"
                  ? "bg-green-500"
                  : connectionStatus.includes("Connect")
                    ? "bg-yellow-500 animate-pulse"
                    : connectionStatus === "Disconnected" ||
                        connectionStatus === "Connection failed"
                      ? "bg-red-500"
                      : "bg-muted-foreground"
              }`}
            />
            {connectionStatus}
          </Badge>
        </div>

        {/* Join / Create */}
        <form onSubmit={joinRoom} className="space-y-3">
          <Input
            placeholder="Paste a room link or enter code"
            value={roomId}
            onChange={(e) => setRoomId(e?.target?.value)}
            className="text-sm h-10"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 h-10 text-sm"
            >
              Join Call
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={createAndJoin}
              className="flex-1 h-10 text-sm"
            >
              New Room
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-12">
          No account needed. End-to-end encrypted.
        </p>
      </div>
    </div>
  );
}
