import { useSocket } from "@/store/socket";
import { useParams } from "next/navigation";

const { useState, useEffect, useRef } = require("react");

const usePeer = () => {
  const socket = useSocket();
  const { roomId } = useParams(); // Updated to use app directory router
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const isPeerSetRef = useRef(false);

  useEffect(() => {
    if (isPeerSetRef.current || !roomId || !socket) return;
    isPeerSetRef.current = true;
    let myPeer;

    const initPeer = async () => {
      try {
        console.log("🔄 Initializing PeerJS...");
        const Peer = (await import("peerjs")).default;
        myPeer = new Peer({
          config: {
            iceServers: [
              // STUN servers — discover public IP
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              // TURN servers — relay media when direct P2P fails (NAT/firewall)
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
            sdpSemantics: "unified-plan", // Use unified plan for better compatibility
            iceCandidatePoolSize: 10, // Gather more ICE candidates
          },
          // Add debug logging
          debug: process.env.NODE_ENV === "development" ? 2 : 0,
        });
        setPeer(myPeer);

        myPeer.on("open", (id) => {
          console.log("✅ PeerJS connected! Your peer ID:", id);
          setMyId(id);

          // Always try to join room - socket will handle connection state
          console.log("📡 Joining room:", roomId, "with peer ID:", id);
          socket.emit("join-room", roomId, id);
        });

        myPeer.on("error", (error) => {
          console.error("❌ PeerJS error:", error);

          // Only reconnect for server/socket errors, NOT per-peer connection failures
          const isConnectionError =
            error.type === "network" ||
            error.type === "server-error" ||
            error.type === "socket-error" ||
            error.type === "socket-closed" ||
            (typeof error === "string" &&
              (error.includes("Lost connection") ||
                error.includes("socket") ||
                error.includes("network")));

          if (isConnectionError) {
            setTimeout(() => {
              if (!myPeer.destroyed && myPeer.disconnected) {
                console.log("🔄 Retrying PeerJS connection...");
                myPeer.reconnect();
              }
            }, 2000);
          }
          // "webrtc" / "Could not connect to peer" errors are per-peer ICE failures
          // and do not require reconnecting to the signaling server
        });

        myPeer.on("disconnected", () => {
          console.log("⚠️ PeerJS disconnected, attempting to reconnect...");
          setTimeout(() => {
            if (!myPeer.destroyed && myPeer.disconnected) {
              myPeer.reconnect();
            }
          }, 2000);
        });
      } catch (error) {
        console.error("❌ Failed to initialize PeerJS:", error);
        isPeerSetRef.current = false; // Allow retry
      }
    };

    initPeer();

    // Cleanup function
    return () => {
      if (myPeer && !myPeer.destroyed) {
        console.log("🧹 Cleaning up PeerJS connection...");
        myPeer.destroy();
      }
    };
  }, [roomId, socket]);

  return {
    peer,
    myId,
  };
};

export default usePeer;
