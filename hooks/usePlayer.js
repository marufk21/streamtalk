import { useState } from "react";
import { cloneDeep } from "lodash";
import { useSocket } from "@/store/socket";
import { useRouter } from "next/navigation";

const usePlayer = (myId, roomId, peer) => {
  const socket = useSocket();
  const [players, setPlayers] = useState({});
  const router = useRouter();
  const playersCopy = cloneDeep(players);

  const playerHighlighted = playersCopy[myId];
  delete playersCopy[myId];

  const nonHighlightedPlayers = playersCopy;

  const leaveRoom = () => {
    if (!socket || !myId) return; // Safety check
    socket.emit("user-leave", myId, roomId);
    console.log("leaving room", roomId);
    peer?.disconnect();
    router.push("/");
  };

  const toggleAudio = () => {
    if (!socket || !myId) return; // Safety check
    console.log("I toggled my audio");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      // Safety check: ensure player exists before toggling
      if (copy[myId]) {
        copy[myId].muted = !copy[myId].muted;
      }
      return { ...copy };
    });
    socket.emit("user-toggle-audio", myId, roomId);
  };

  const toggleVideo = () => {
    if (!socket || !myId) return; // Safety check
    console.log("I toggled my video");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      // Safety check: ensure player exists before toggling
      if (copy[myId]) {
        copy[myId].playing = !copy[myId].playing;
      }
      return { ...copy };
    });
    socket.emit("user-toggle-video", myId, roomId);
  };

  return {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};

export default usePlayer;
