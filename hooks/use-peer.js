import { useSocket } from "@/store/socket";
import { useParams } from "next/navigation";

const { useState, useEffect, useRef } = require("react");

const usePeer = () => {
  const socket = useSocket();
  const { roomId } = useParams(); // Updated to use app directory router
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);

  useEffect(() => {
    if (isPeerSet.current || !roomId || !socket) return;
    isPeerSet.current = true;
    let myPeer;

    const initPeer = async () => {
      try {
        console.log("🔄 Initializing PeerJS...");
        const Peer = (await import("peerjs")).default;
        myPeer = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun3.l.google.com:19302" },
              { urls: "stun:stun4.l.google.com:19302" },
              // Additional STUN servers for better connectivity
              { urls: "stun:stun.ekiga.net" },
              { urls: "stun:stun.ideasip.com" },
            ],
            sdpSemantics: 'unified-plan', // Use unified plan for better compatibility
            iceCandidatePoolSize: 10, // Gather more ICE candidates
          },
          // Add debug logging
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
        });
        setPeer(myPeer);

        myPeer.on("open", (id) => {
          console.log("✅ PeerJS connected! Your peer ID:", id);
          setMyId(id);

          // Check if socket is connected before emitting
          if (socket.connected) {
            console.log("📡 Joining room:", roomId, "with peer ID:", id);
            socket.emit("join-room", roomId, id);
          } else {
            console.log("⏳ Socket not connected, waiting...");
            socket.on("connect", () => {
              console.log("📡 Socket connected, now joining room:", roomId);
              socket.emit("join-room", roomId, id);
            });
          }
        });

        myPeer.on("error", (error) => {
          console.error("❌ PeerJS error:", error);
          // Retry connection after a delay
          setTimeout(() => {
            if (!myPeer.destroyed) {
              console.log("🔄 Retrying PeerJS connection...");
              myPeer.reconnect();
            }
          }, 2000);
        });

        myPeer.on("disconnected", () => {
          console.log("⚠️ PeerJS disconnected, attempting to reconnect...");
          if (!myPeer.destroyed) {
            myPeer.reconnect();
          }
        });
      } catch (error) {
        console.error("❌ Failed to initialize PeerJS:", error);
        isPeerSet.current = false; // Allow retry
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
