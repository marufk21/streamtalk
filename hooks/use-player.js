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

    console.log(`👋 Leaving room ${roomId} with peer ID ${myId}`);

    // Emit leave event to server
    socket.emit("user-leave", myId, roomId);

    // Close peer connection
    if (peer && !peer.destroyed) {
      peer.disconnect();
    }

    // Navigate back to home
    router.push("/");
  };

  const toggleAudio = () => {
    if (!socket || !myId) return; // Safety check

    // Toggle the actual media stream first
    let newAudioState = false;
    if (toggleMediaAudio) {
      newAudioState = toggleMediaAudio();
    }

    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      // Safety check: ensure player exists before toggling
      if (copy[myId]) {
        // Always keep own audio muted in ReactPlayer to prevent feedback
        copy[myId].muted = true;
        // But track the actual audio state separately
        copy[myId].audioEnabled = newAudioState;
      }
      return { ...copy };
    });

    // Notify other users about the audio toggle
    socket.emit("user-toggle-audio", myId, roomId);

    console.log(`Audio toggled: ${newAudioState ? "ON" : "OFF"}`);
  };

  const toggleVideo = () => {
    if (!socket || !myId) return; // Safety check

    // Toggle the actual media stream
    if (toggleMediaVideo) {
      toggleMediaVideo();
    }

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
