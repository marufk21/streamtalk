import { useState } from "react";
import { cloneDeep } from "lodash";
import { useSocket } from "@/store/socket";
import { useRouter } from "next/navigation";

const usePlayer = (myId, roomId, peer, mediaControls = {}) => {
  const socket = useSocket();
  const [players, setPlayers] = useState({});
  const router = useRouter();
  const playersCopy = cloneDeep(players);

  const {
    toggleAudio: toggleMediaAudio,
    toggleVideo: toggleMediaVideo,
    isAudioEnabled,
    isVideoEnabled,
  } = mediaControls;

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

    // Toggle the actual media stream
    if (toggleMediaAudio) {
      toggleMediaAudio();
    }

    console.log("I toggled my audio");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      // Safety check: ensure player exists before toggling
      if (copy[myId]) {
        copy[myId].muted = !isAudioEnabled; // Use actual audio state
      }
      return { ...copy };
    });
    socket.emit("user-toggle-audio", myId, roomId);
  };

  const toggleVideo = () => {
    if (!socket || !myId) return; // Safety check

    // Toggle the actual media stream
    if (toggleMediaVideo) {
      toggleMediaVideo();
    }

    console.log("I toggled my video");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      // Safety check: ensure player exists before toggling
      if (copy[myId]) {
        copy[myId].playing = isVideoEnabled; // Use actual video state
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
