"use client";

import { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "next/navigation";

import { useSocket } from "@/store/socket";
import usePeer from "@/hooks/use-peer";
import useMediaStream from "@/hooks/use-media-stream";
import usePlayer from "@/hooks/use-player";
import useChat from "@/hooks/use-chat";

import SimpleCallLayout from "@/components/ui/simple-call-layout";
import FloatingControls from "@/components/ui/floating-controls";
import SimpleVideoGrid from "@/components/ui/simple-video-grid";
import SimpleChat from "@/components/ui/simple-chat";
import PermissionRequest from "@/components/ui/permission-request";

const Room = () => {
  const socket = useSocket();
  const { roomId } = useParams();
  const { peer, myId } = usePeer();
  const {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio: toggleStreamAudio,
    toggleVideo: toggleStreamVideo,
    error: mediaError,
    permissions,
    audioDevices,
    selectedAudioInput,
    selectedAudioOutput,
    switchAudioInput,
    switchAudioOutput,
  } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer, {
    toggleAudio: toggleStreamAudio,
    toggleVideo: toggleStreamVideo,
    isAudioEnabled,
    isVideoEnabled,
  });

  const [users, setUsers] = useState([]);
  const [callStartTime] = useState(() => Date.now());
  const [callDuration, setCallDuration] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize chat functionality
  const {
    messages,
    connectedPeers,
    isConnected: isChatConnected,
    sendMessage,
    cleanupPeerDataChannel,
  } = useChat(peer, myId, users);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [callStartTime]);

  // Add yourself to players when stream is ready
  // Initial setup: add yourself to players when stream and myId are ready.
  // Toggles are handled by usePlayer — no need to re-fire on audio/video state changes.
  const hasSetupPlayer = useRef(false);
  useEffect(() => {
    if (hasSetupPlayer.current || !myId || !stream) return;
    hasSetupPlayer.current = true;
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: isVideoEnabled,
        audioEnabled: isAudioEnabled,
      },
    }));
  }, [myId, stream, isAudioEnabled, isVideoEnabled, setPlayers]);

  // Enhanced retry media stream with audio diagnostics
  const retryMediaStream = async () => {
    if (process.env.NODE_ENV === "development") {
      const { quickAudioCheck } = await import("@/utils/audio-diagnostics");
      console.log("Running audio diagnostics before retry...");
      await quickAudioCheck();
    }
    window.location.reload();
  };

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`user connected in room with userId ${newUser}`);
      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: false,
            playing: true,
            audioEnabled: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });

      call.on("close", () => {
        console.log(`Outgoing call closed with ${newUser}`);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });
      });

      call.on("error", (error) => {
        console.error(`Outgoing call error with ${newUser}:`, error);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          copy[userId].audioEnabled = !copy[userId].audioEnabled;
          copy[userId].muted = !copy[userId].audioEnabled;
        }
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);

      cleanupPeerDataChannel(userId);

      if (users[userId]) {
        users[userId].close();
      }

      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        delete copy[userId];
        return copy;
      });

      setUsers((prev) => {
        const copy = cloneDeep(prev);
        delete copy[userId];
        return copy;
      });
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users, cleanupPeerDataChannel]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false,
            playing: true,
            audioEnabled: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });

      call.on("close", () => {
        console.log(`Call closed with ${callerId}`);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });
      });

      call.on("error", (error) => {
        console.error(`Call error with ${callerId}:`, error);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });
      });
    });
  }, [peer, setPlayers, stream]);

  // Apply audio output device to all video elements when it changes
  useEffect(() => {
    if (selectedAudioOutput && selectedAudioOutput !== "default") {
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.setSinkId) {
          video.setSinkId(selectedAudioOutput).catch((err) => {
            console.warn("Failed to set audio output device:", err);
          });
        }
      });
    }
  }, [selectedAudioOutput]);

  return (
    <>
      {/* Permission Request Overlay */}
      {(mediaError || !permissions.audio || !permissions.video) && (
        <PermissionRequest
          error={mediaError}
          permissions={permissions}
          onRetry={retryMediaStream}
        />
      )}

      <SimpleCallLayout
        roomId={roomId}
        participants={Object.keys(players)}
        onShare={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
      >
        {/* Video Grid */}
        <div className="h-full p-4 pb-20 overflow-hidden">
          <SimpleVideoGrid
            players={players}
            highlightedPlayerId={
              playerHighlighted
                ? Object.keys(players).find(
                    (id) => players[id] === playerHighlighted
                  )
                : null
            }
            onPlayerClick={(playerId) => {
              console.log(`Player ${playerId} clicked`);
            }}
            myId={myId}
            isAudioEnabled={isAudioEnabled}
            selectedAudioOutput={selectedAudioOutput}
            className="h-full"
          />
        </div>
      </SimpleCallLayout>

      {/* Floating Controls */}
      {myId && socket && (
        <FloatingControls
          muted={!isAudioEnabled}
          playing={isVideoEnabled}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          leaveRoom={leaveRoom}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isChatOpen={isChatOpen}
          unreadCount={messages.length}
        />
      )}

      {/* Chat Panel */}
      {myId && (
        <SimpleChat
          messages={messages}
          onSendMessage={sendMessage}
          isConnected={isChatConnected}
          connectedPeers={connectedPeers}
          myId={myId}
          isOpen={isChatOpen}
          onToggle={setIsChatOpen}
        />
      )}
    </>
  );
};

export default Room;
